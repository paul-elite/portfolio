'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion';
import type { SiteConfig } from '@/lib/content-model';
import { isExternal, type ReelItem, type ReelSection } from '@/lib/reel';
import CaseStudyBook from './CaseStudyBook';
import AnimatedScreen from './AnimatedScreen';
import { ANIMATED_SCREENS, type AnimatedScreen as AnimatedScreenSpec } from '@/lib/screen-animations';

interface WorkReelProps {
  config: SiteConfig;
  sections: ReelSection[];
}

// Text column width and its left edge; the reel starts on the same edge
const COLUMN = 625;
const GUTTER = `max(1.5rem, calc((100vw - ${COLUMN}px) / 2))`;


const projectImage = (p: ReelItem) => p.preview || p.previewImages?.[0] || '';
// Opens outside links in a new tab
const linkTarget = (href: string) => (isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {});

// Ayomide-style inline link: same size and colour as the text, dotted underline
const inlineLink = 'underline decoration-dotted decoration-[#b2b2b2] decoration-1 underline-offset-4 hover:decoration-[#2a2a2a] transition-colors';

type Device = 'laptop' | 'phone';

// The phone's outline (public/mockups/iphone-16-pro-max-mask.png, same size as the frame), used to mask its screen
const PHONE_MASK = {
  maskImage: 'url(/mockups/iphone-16-pro-max-mask.png)',
  WebkitMaskImage: 'url(/mockups/iphone-16-pro-max-mask.png)',
  maskSize: '100% 100%',
  WebkitMaskSize: '100% 100%',
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
} as const;

// Springs after mikematas.com, tuned by feel: the device eases out of the reel with a hint of
// bounce and settles back into its slot without overshooting; paging glides with a little give
const OPEN_SPRING = { type: 'spring', stiffness: 260, damping: 32, mass: 1 } as const;
const CLOSE_SPRING = { type: 'spring', stiffness: 300, damping: 35, mass: 1, restDelta: 0.002, restSpeed: 0.02 } as const;
const PAGE_SPRING = { type: 'spring', stiffness: 240, damping: 32, mass: 1 } as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
// Phones slide in from the right as they come into view: a long, decelerating glide with no
// overshoot (Material 3 emphasized decelerate), fading in over its first half, a beat apart
const SLIDE_IN = { x: { type: 'spring' as const, stiffness: 180, damping: 30, mass: 1 }, opacity: { duration: 0.5, ease: 'easeOut' as const } };
const SLIDE_FROM = 52;
const SLIDE_STAGGER_MS = 120;
// How long the page takes to fade before navigating to a case study
const DEPART_MS = 200;

// `aspects`: each project's screenshot shape, from the reel, so the view picks the same device
interface Zoom { index: number; origin: DOMRect; aspects: Map<string, number> }

/**
 * Home: a short introduction set in small, even type (after dahnizzy.com), with the work
 * shown on device mockups in one sideways reel (after mikematas.com). The "Work" line names
 * whichever project sits at the column edge. Clicking a device zooms it into a project view
 * (after mikematas.com): it springs out of the reel, the project's details fade in beside it,
 * neighbouring projects page in sideways, and closing springs it back into its slot.
 */
export default function WorkReel({ config, sections }: WorkReelProps) {
  // The section the reel shows (Work); the projects in it make the row above the reel
  const tab = 0;
  // The ⋯ menu in the top-right corner
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const section = sections[tab] ?? sections[0];
  const projects = section.items;
  const hasItems = projects.length > 0;
  // Items that have slid into view (each enters once)
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const itemKey = (p: ReelItem) => `${section.id}:${p.slug}`;
  // One entry per project (its extra screens share it), pointing at its first item in the reel
  const projectRow = projects.reduce<{ slug: string; title: string; first: number }[]>((row, p, i) => {
    const slug = p.slug.split('~')[0];
    if (!row.some(r => r.slug === slug)) row.push({ slug, title: p.title, first: i });
    return row;
  }, []);
  const thumbLeft = useMotionValue('0%');
  const thumbWidth = useMotionValue('100%');
  const barOpacity = useMotionValue(0);
  const reelRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // The project in view, and which way the reel last moved (for the title swap)
  const [view, setView] = useState({ active: 0, dir: 1 });
  const { active, dir } = view;
  const viewIndex = useRef(0);
  useEffect(() => { viewIndex.current = active; }, [active]);
  const [departing, setDeparting] = useState(false);
  const router = useRouter();
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const [leaving, setLeaving] = useState(false);
  const zoomRef = useRef<Zoom | null>(null);
  const historyOverlayRef = useRef(false);
  const aspects = useRef(new Map<string, number>());
  const quietFocus = useRef(false);
  const returnFocus = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const current = projects[active];
  const currentProject = current?.slug.split('~')[0];
  const dimmed = zoom !== null && !leaving;

  useEffect(() => {
    zoomRef.current = zoom;
    // Back to the project that was showing, once the reel is interactive again
    if (zoom || returnFocus.current === null) return;
    quietFocus.current = true;
    itemRefs.current[returnFocus.current]?.focus({ preventScroll: true });
    quietFocus.current = false;
    returnFocus.current = null;
  }, [zoom]);
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false); };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('pointerdown', onDown); window.removeEventListener('keydown', onKey); };
  }, [menu]);
  const recordAspect = useCallback((slug: string, a: number) => { aspects.current.set(slug, a); }, []);

  // The project nearest the column's left edge is the one "in view"
  const measure = useCallback(() => {
    const reel = reelRef.current;
    if (!reel || projects.length === 0) return;
    // Narrow screens centre the project in focus; wider ones line it up with the text column
    const centred = window.matchMedia('(max-width: 767px)').matches;
    const reelBox = reel.getBoundingClientRect();
    const anchorX = centred ? reelBox.left + reelBox.width / 2 : (columnRef.current?.getBoundingClientRect().left ?? 0) + 80;
    const atEnd = !centred && reel.scrollLeft + reel.clientWidth >= reel.scrollWidth - 4;
    let best = 0;
    let bestDistance = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const distance = atEnd && i === projects.length - 1 ? -1
        : Math.abs((centred ? r.left + r.width / 2 : r.left + Math.min(r.width, 200) / 2) - anchorX);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    setView(v => (v.active === best ? v : { active: best, dir: best > v.active ? 1 : -1 }));
  }, [projects.length]);

  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;
    let frame = requestAnimationFrame(measure);
    let hide: ReturnType<typeof setTimeout> | undefined;
    // The scroll indicator: thumb sized to the visible share of the reel, shown only while it scrolls
    const placeThumb = () => {
      const max = reel.scrollWidth - reel.clientWidth;
      const share = Math.max(18, (reel.clientWidth / reel.scrollWidth) * 100);
      thumbWidth.set(`${share}%`);
      thumbLeft.set(`${max > 0 ? (reel.scrollLeft / max) * (100 - share) : 0}%`);
      return max > 0;
    };
    // On narrow screens the reel's ends pad out so the first and last projects can sit in the middle
    const placePadding = () => {
      const items = itemRefs.current.filter(Boolean) as HTMLElement[];
      if (!window.matchMedia('(max-width: 767px)').matches || items.length === 0) {
        reel.style.paddingLeft = '';
        reel.style.paddingRight = '';
        return;
      }
      reel.style.paddingLeft = `${Math.max(24, (reel.clientWidth - items[0].offsetWidth) / 2)}px`;
      reel.style.paddingRight = `${Math.max(24, (reel.clientWidth - items[items.length - 1].offsetWidth) / 2)}px`;
    };
    placePadding();
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
      placePadding();
      placeThumb();
    };
    const onScroll = () => {
      onResize();
      if (!placeThumb()) return;
      animate(barOpacity, 1, { duration: 0.15 });
      clearTimeout(hide);
      hide = setTimeout(() => animate(barOpacity, 0, { duration: 0.4 }), 700);
    };
    reel.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(hide);
      reel.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
    // Re-run per tab: the items, and so the end padding, change
  }, [measure, thumbLeft, thumbWidth, barOpacity, section.id]);

  // Move one artifact at a time, with a quiet pause between snaps.
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel || reduceMotion || projects.length < 2 || zoom) return;
    let paused = false;
    let direction = 1;
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      if (!paused && !document.hidden) {
        const current = viewIndex.current;
        // Reverse at either end instead of jumping back to the first artifact.
        if (current >= projects.length - 1) direction = -1;
        else if (current <= 0) direction = 1;
        const next = Math.max(0, Math.min(projects.length - 1, current + direction));
        viewIndex.current = next;
        scrollToItem(next);
      }
      timer = setTimeout(advance, 4200);
    };
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    timer = setTimeout(advance, 4200);
    reel.addEventListener('pointerenter', pause);
    reel.addEventListener('pointerleave', resume);
    reel.addEventListener('focusin', pause);
    reel.addEventListener('focusout', resume);
    reel.addEventListener('touchstart', pause, { passive: true });
    reel.addEventListener('touchend', resume, { passive: true });
    return () => {
      clearTimeout(timer);
      reel.removeEventListener('pointerenter', pause);
      reel.removeEventListener('pointerleave', resume);
      reel.removeEventListener('focusin', pause);
      reel.removeEventListener('focusout', resume);
      reel.removeEventListener('touchstart', pause);
      reel.removeEventListener('touchend', resume);
    };
  }, [projects.length, reduceMotion, zoom]);

  // Browser/device Back dismisses the expanded project without leaving the homepage.
  useEffect(() => {
    const onPopState = () => {
      if (historyOverlayRef.current) {
        historyOverlayRef.current = false;
        setZoom(null);
        setLeaving(false);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Reveal phones as they come into view, left to right, a beat apart
  useEffect(() => {
    if (reduceMotion) return;
    let next = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const io = new IntersectionObserver(entries => {
      const now = performance.now();
      entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.left - b.boundingClientRect.left)
        .forEach(e => {
          io.unobserve(e.target);
          const key = (e.target as HTMLElement).dataset.reelKey;
          if (!key) return;
          const start = Math.max(now, next);
          next = start + SLIDE_STAGGER_MS;
          timers.push(setTimeout(() => setRevealed(r => new Set(r).add(key)), start - now));
        });
    }, { threshold: 0.2 });
    itemRefs.current.forEach(el => { if (el) io.observe(el); });
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, [projects, reduceMotion]);

  // On desktop, an ordinary vertical wheel or trackpad swipe moves the reel sideways
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;
    const onWheel = (e: WheelEvent) => {
      if (zoomRef.current) return; // the project view pages on its own
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      if (reel.scrollWidth <= reel.clientWidth) return;
      // Let the page scroll normally on narrow screens, where the layout stacks
      if (window.matchMedia('(max-width: 767px)').matches) return;
      e.preventDefault();
      reel.scrollLeft += e.deltaY;
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
    // Re-attach when an empty tab's placeholder reel gives way to the real one
  }, [hasItems]);

  const scrollToItem = (i: number) => {
    const el = itemRefs.current[i];
    const reel = reelRef.current;
    if (!el || !reel) return;
    const r = el.getBoundingClientRect();
    const box = reel.getBoundingClientRect();
    const offset = window.matchMedia('(max-width: 767px)').matches
      ? r.left + r.width / 2 - (box.left + box.width / 2)
      : r.left - (columnRef.current?.getBoundingClientRect().left ?? 0);
    reel.scrollTo({ left: reel.scrollLeft + offset, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Zoom a device out of the reel, from exactly where it sits
  const openAt = (i: number) => {
    const device = itemRefs.current[i]?.firstElementChild?.firstElementChild;
    if (!device) return;
    setLeaving(false);
    window.history.pushState({ portfolioProjectOverlay: true }, '', window.location.href);
    historyOverlayRef.current = true;
    setZoom({ index: i, origin: device.getBoundingClientRect(), aspects: new Map(aspects.current) });
  };

  // Where project i's device sits in the reel, for the flight home; brought into view first if needed
  const slotFor = (i: number) => {
    const reel = reelRef.current;
    const el = itemRefs.current[i];
    if (!reel || !el) return null;
    const r = el.getBoundingClientRect();
    if (r.left < 0 || r.right > window.innerWidth) {
      reel.scrollLeft += r.left - (columnRef.current?.getBoundingClientRect().left ?? 0);
    }
    return el.firstElementChild?.firstElementChild?.getBoundingClientRect() ?? null;
  };

  // Leave for a case study: fade the page out, then navigate, so the case study rises in after it.
  // Modified clicks still open it in a new tab or window.
  const leaveFor = (e: React.MouseEvent, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0 || isExternal(href)) return;
    e.preventDefault();
    if (reduceMotion) { router.push(href); return; }
    setDeparting(true);
    setTimeout(() => router.push(href), DEPART_MS);
  };

  const onZoomClosed = (i: number) => {
    if (historyOverlayRef.current) {
      historyOverlayRef.current = false;
      if (window.history.state?.portfolioProjectOverlay) window.history.back();
    }
    returnFocus.current = i;
    setZoom(null);
    setLeaving(false);
  };

  const onReelKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = Math.min(projects.length - 1, Math.max(0, active + (e.key === 'ArrowRight' ? 1 : -1)));
    scrollToItem(next);
    itemRefs.current[next]?.focus({ preventScroll: true });
  };

  const email = config.social.email
    ? config.social.email.startsWith('mailto:') ? config.social.email : `mailto:${config.social.email}`
    : '';
  const socials = [
    config.social.twitter && { label: 'X', href: config.social.twitter },
    config.social.github && { label: 'GitHub', href: config.social.github },
    config.social.instagram && { label: 'Instagram', href: config.social.instagram },
    config.social.linkedin && { label: 'LinkedIn', href: config.social.linkedin },
  ].filter(Boolean) as { label: string; href: string }[];
  const bio = config.bio || config.title;
  const menuGroups = [
    [
      { label: 'Writing', href: '/explore?view=writings' },
      { label: 'Illustration', href: '/explore?view=illustration' },
      { label: 'Interaction', href: '/explore?view=interaction' },
    ],
    [...socials, ...(email ? [{ label: 'Email', href: email }] : [])],
  ].filter(g => g.length > 0);

  // Title swap; `d` is the direction the reel moved
  const swap = {
    enter: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, y: d * 8, filter: 'blur(3px)' }),
    center: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.38, ease: EASE_OUT } },
    exit: (d: number) => (reduceMotion
      ? { opacity: 0, transition: { duration: 0.15 } }
      : { opacity: 0, y: d * -8, filter: 'blur(3px)', transition: { duration: 0.2, ease: EASE_OUT } }),
  };

  return (
    // Opacity only on the root: a transform here would move the fixed project view
    <motion.div
      className="relative h-dvh overflow-hidden flex flex-col bg-white text-[14px] leading-6 text-[#2a2a2a] font-sans"
      initial={false}
      animate={{ opacity: departing ? 0 : 1 }}
      transition={{ duration: DEPART_MS / 1000, ease: EASE_OUT }}
    >
      {/* Plus navigation opens a full-height drawer from the left. */}
      <motion.div
        ref={menuRef}
        className="absolute inset-0 z-40 pointer-events-none"
        animate={{ opacity: dimmed ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        inert={zoom !== null}
      >
        <button
          type="button"
          onClick={() => setMenu(m => !m)}
          aria-label={menu ? 'Close navigation' : 'Open navigation'}
          aria-haspopup="dialog"
          aria-expanded={menu}
          aria-controls="portfolio-side-menu"
          className="pointer-events-auto absolute z-50 top-3 left-[max(12px,calc((100vw-625px)/2-10px))] md:top-4 h-11 w-11 grid place-items-center rounded-full text-[#2a2a2a] hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a2a2a] transition-colors"
        >
          <span className={`block h-7 w-7 transition-transform duration-300 ${menu ? 'rotate-45' : ''}`} aria-hidden="true">
            <img src="/plus-figma.svg" alt="" className="block h-full w-full" />
          </span>
        </button>
        <AnimatePresence>
          {menu && (
            <>
              <motion.button
                type="button"
                aria-label="Close navigation"
                className="pointer-events-auto absolute inset-0 bg-black/25"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setMenu(false)}
              />
              <motion.nav
                id="portfolio-side-menu"
                aria-label="Main navigation"
                className="pointer-events-auto absolute inset-y-0 left-0 w-[70%] bg-white shadow-[12px_0_48px_rgba(0,0,0,0.08)] px-8 md:px-12 pt-28 pb-12 overflow-y-auto"
                initial={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
                animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
                transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 34 }}
              >
                
                {menuGroups.map((group, g) => (
                  <div key={g} className={g > 0 ? 'mt-8' : ''}>
                    {group.map(item => (
                      <a
                        key={item.label}
                        href={item.href}
                        {...(isExternal(item.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        onClick={() => setMenu(false)}
                        className="block py-3 text-[22px] leading-8 tracking-[-0.025em] font-medium text-[#252525] hover:text-[#777] focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                      >
                        {item.label}
                      </a>
                    ))}
                  </div>
                ))}
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.header
        className="w-full max-w-[625px] mx-auto px-6 md:px-0 pt-28 md:pt-32"
        animate={reduceMotion ? { opacity: dimmed ? 0 : 1 } : { opacity: dimmed ? 0 : 1, scale: dimmed ? 0.985 : 1 }}
        transition={{ duration: dimmed ? 0.25 : 0.45, delay: dimmed ? 0 : 0.08, ease: EASE_OUT }}
        aria-hidden={zoom ? true : undefined}
        inert={zoom !== null}
      >
        <div ref={columnRef} className="grid gap-6 page-in">
          {/* The name at the top left, over the bio */}
          <div className="grid gap-3">
            <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.025em] text-[#1a1a1a]">{config.name}</h1>
            {bio && <p>{bio}</p>}
            {email && (
              <a href={email} aria-label="Send email" className="mt-2 self-start justify-self-start inline-flex h-9 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#487cff] to-[#2b64f8] px-3 text-sm font-medium tracking-[-0.01em] text-white shadow-[0_1px_1px_rgba(20,31,87,0.2),0_2px_4px_-2px_rgba(20,31,87,0.4),0_0_0_1px_#2b64f8,inset_0_1px_0.5px_rgba(255,255,255,0.13)] transition-[background,box-shadow] duration-200 hover:bg-[#3e71f6] active:bg-[#2658e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#2b64f8]">Send email</a>
            )}
          </div>


        </div>
      </motion.header>


      {projects.length > 0 && (
        <motion.section
          aria-label="Work"
          className="relative flex-1 min-h-0 flex items-end pt-8 pb-10 md:pb-14"
          // Opacity only: the reel mustn't move, so a closing project can fly back to its slot
          animate={{ opacity: dimmed ? 0 : 1 }}
          transition={{ duration: dimmed ? 0.25 : 0.45, delay: dimmed ? 0 : 0.08, ease: EASE_OUT }}
          aria-hidden={zoom ? true : undefined}
          inert={zoom !== null}
        >
          <div
            ref={reelRef}
            role="list"
            tabIndex={0}
            aria-label="Projects. Use the left and right arrow keys to move through them."
            onKeyDown={onReelKey}
            className="w-full h-[min(700px,92vw)] max-h-full md:h-[min(520px,42vw)] flex items-end gap-12 overflow-x-auto overflow-y-hidden hide-scrollbar overscroll-x-contain focus-visible:outline-none snap-x snap-mandatory"
            // Same left edge as the text column
            style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
          >
            {projects.map((p, i) => (
              <Link
                key={itemKey(p)}
                data-reel-key={itemKey(p)}
                role="listitem"
                ref={el => { itemRefs.current[i] = el; }}
                href={p.href}
                aria-label={`${p.title}${p.description ? `, ${p.description}` : ''}`}
                onFocus={() => { if (!quietFocus.current) scrollToItem(i); }}
                onClick={e => {
                  // Modified clicks still open the case study in a new tab or window
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  openAt(i);
                }}
                className={`shrink-0 h-full flex items-end cursor-pointer snap-center md:snap-start focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#2a2a2a] rounded-lg ${zoom?.index === i ? 'opacity-0' : ''}`}
              >
                {/* The entrance: slides in from the right, once, as it comes into view */}
                <motion.div
                  className="relative h-full flex items-end pt-[60px]"
                  initial={false}
                  animate={reduceMotion || revealed.has(itemKey(p)) ? { x: 0, opacity: 1 } : { x: SLIDE_FROM, opacity: 0 }}
                  transition={revealed.has(itemKey(p)) ? SLIDE_IN : { duration: 0 }}
                >
                  <span className="absolute top-[32px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 h-7 flex items-center justify-center text-[12px] leading-none font-medium text-[#252525] shadow-[0_2px_6px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.04] pointer-events-none">{p.title.trim().split(/\s+/).slice(0, 2).join(' ')}</span>
                  <DeviceMock project={p} index={i} onAspect={recordAspect} revealed={!!reduceMotion || revealed.has(itemKey(p))} />
                </motion.div>
              </Link>
            ))}
          </div>
          {/* Small rounded scroll indicator, on the column's left edge, only while the reel scrolls */}
          <motion.div
            aria-hidden="true"
            className="absolute bottom-4 md:bottom-6 h-[3px] w-14 rounded-full bg-[#f0f0f0] pointer-events-none"
            style={{ left: GUTTER, opacity: barOpacity }}
          >
            <motion.div className="absolute inset-y-0 rounded-full bg-[#d4d4d4]" style={{ left: thumbLeft, width: thumbWidth }} />
          </motion.div>
        </motion.section>
      )}

      {zoom && (
        <ProjectZoom
          projects={projects}
          start={zoom}
          reduceMotion={!!reduceMotion}
          onIndex={i => setZoom(z => (z ? { ...z, index: i } : z))}
          slotFor={slotFor}
          onLeave={() => setLeaving(true)}
          onClosed={onZoomClosed}
          onCaseStudy={leaveFor}
        />
      )}
    </motion.div>
  );
}

/* ---------- Project view ---------- */

function ProjectZoom({ projects, start, reduceMotion, onIndex, slotFor, onLeave, onClosed, onCaseStudy }: {
  projects: ReelItem[];
  start: Zoom;
  reduceMotion: boolean;
  onIndex: (i: number) => void;
  slotFor: (i: number) => DOMRect | null;
  onLeave: () => void;
  onClosed: (i: number) => void;
  onCaseStudy: (e: React.MouseEvent, href: string) => void;
}) {
  const index = start.index;
  const project = projects[index];
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const devices = useRef(new Map<string, HTMLDivElement>());
  const [closing, setClosing] = useState(false);
  // Once the device has landed, its frame clips paging so projects slide through a window
  const [landed, setLanded] = useState(false);
  const [direction, setDirection] = useState(0);
  // The flight between the reel and the view, applied to whichever device is showing
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const fade = useMotionValue(reduceMotion ? 0 : 1);

  // Open: start the device exactly over its reel slot and spring it into place
  useLayoutEffect(() => {
    const el = devices.current.get(projects[start.index].slug);
    if (reduceMotion || !el) {
      animate(fade, 1, { duration: 0.2 }).then(() => setLanded(true));
      return;
    }
    const to = el.getBoundingClientRect();
    const from = start.origin;
    x.set(from.left + from.width / 2 - (to.left + to.width / 2));
    y.set(from.top + from.height / 2 - (to.top + to.height / 2));
    scale.set(from.height / to.height);
    const flights = [animate(x, 0, OPEN_SPRING), animate(y, 0, OPEN_SPRING), animate(scale, 1, OPEN_SPRING)];
    flights[2].then(() => setLanded(true));
    return () => flights.forEach(f => f.stop());
    // Runs once, on open; paging doesn't fly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    onLeave();
    const el = devices.current.get(project.slug);
    const slot = slotFor(index);
    if (reduceMotion || !el || !slot) {
      animate(fade, 0, { duration: 0.2 }).then(() => onClosed(index));
      return;
    }
    // Where the device would sit untransformed, then the flight from there back to its slot
    const now = el.getBoundingClientRect();
    const s = scale.get();
    const cx = now.left + now.width / 2 - x.get();
    const cy = now.top + now.height / 2 - y.get();
    const height = now.height / s;
    animate(x, slot.left + slot.width / 2 - cx, CLOSE_SPRING);
    animate(y, slot.top + slot.height / 2 - cy, CLOSE_SPRING);
    animate(scale, slot.height / height, CLOSE_SPRING).then(() => onClosed(index));
  }, [closing, onLeave, project.slug, slotFor, index, reduceMotion, fade, scale, x, y, onClosed]);

  const go = useCallback((step: number) => {
    const next = index + step;
    if (closing || next < 0 || next >= projects.length) return;
    setDirection(step);
    onIndex(next);
  }, [closing, index, projects.length, onIndex]);

  // Keys: Escape closes, arrows page, Tab stays inside the view
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Tab' && rootRef.current) {
        const items = [...rootRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close, go]);

  // A wheel or trackpad swipe pages once per gesture
  useEffect(() => {
    let sum = 0;
    let lastPage = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      sum += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      clearTimeout(idle);
      idle = setTimeout(() => { sum = 0; }, 180);
      if (Math.abs(sum) > 60 && performance.now() - lastPage > 550) {
        go(Math.sign(sum));
        lastPage = performance.now();
        sum = 0;
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => { window.removeEventListener('wheel', onWheel); clearTimeout(idle); };
  }, [go]);

  // The page behind doesn't scroll while the view is open
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = 'hidden';
    backRef.current?.focus({ preventScroll: true });
    return () => { html.style.overflow = before; };
  }, []);

  // Touch: swipe sideways to page, down to close
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') touch.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const t = touch.current;
    touch.current = null;
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else if (dy > 90 && dy > Math.abs(dx) * 1.5) close();
  };

  // Outgoing and incoming devices travel together, shrinking slightly as they pass
  const slide = reduceMotion ? {
    enter: { opacity: 0 },
    center: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  } : {
    enter: (d: number) => ({ x: `${d * 60}%`, scale: d === 0 ? 1 : 0.94, opacity: d === 0 ? 1 : 0 }),
    center: { x: 0, scale: 1, opacity: 1, transition: { x: PAGE_SPRING, scale: PAGE_SPRING, opacity: { duration: 0.3, ease: EASE_OUT } } },
    exit: (d: number) => ({ x: `${d * -60}%`, scale: 0.94, opacity: 0, transition: { x: PAGE_SPRING, scale: PAGE_SPRING, opacity: { duration: 0.28, ease: EASE_OUT } } }),
  };
  // The details cross over the same way, a beat behind the device
  const text = {
    enter: (d: number) => ({ opacity: 0, x: reduceMotion ? 0 : d * 14 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.06, ease: EASE_OUT } },
    exit: (d: number) => ({ opacity: 0, x: reduceMotion ? 0 : d * -14, transition: { duration: 0.18, ease: EASE_OUT } }),
  };
  const details = [project.role, project.year].filter(Boolean) as string[];

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-50 overflow-hidden text-[14px] leading-6 text-[#2a2a2a] touch-pan-y"
      style={{ opacity: fade }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { touch.current = null; }}
      onClick={e => { if ((e.target as HTMLElement).dataset.backdrop !== undefined) close(); }}
      data-backdrop
    >
      <motion.button
        ref={backRef}
        type="button"
        onClick={close}
        aria-label="Back to all work"
        className="absolute z-10 left-3 top-3 md:left-7 md:top-7 h-11 w-11 grid place-items-center rounded-full text-[#8d8d8d] hover:text-[#2a2a2a] hover:bg-neutral-100 focus-visible:outline-none focus-visible:bg-neutral-100 focus-visible:text-[#2a2a2a] transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: 0.2, delay: closing ? 0 : 0.15 }}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 4l-8 8 8 8" /></svg>
      </motion.button>

      <div data-backdrop className="h-full w-full flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6 pt-20 pb-8 md:px-12 md:py-12">
        {/* The device; projects page sideways through this frame */}
        <div data-backdrop className={`relative md:order-2 shrink-0 w-full md:w-[min(56vw,1040px)] h-[min(56vh,120vw)] md:h-[min(72vh,640px)] flex items-center justify-center ${landed && !closing ? 'overflow-hidden' : ''}`}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={project.slug}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              data-backdrop
              className="h-full w-full flex items-center justify-center"
            >
              <Link href={project.href} {...linkTarget(project.href)} onClick={e => onCaseStudy(e, project.href)} aria-label={`${project.cta}: ${project.title}`} className="h-full flex items-center justify-center focus-visible:outline-none" tabIndex={-1} draggable={false}>
                <DeviceMock
                  project={project}
                  index={index}
                  zoomed
                  initialAspect={start.aspects.get(project.slug)}
                  rootRef={el => { if (el) devices.current.set(project.slug, el); }}
                  flight={{ x, y, scale }}
                />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* The project's details, after the device lands */}
        <motion.div
          className="md:order-1 w-full max-w-[400px] md:w-[220px] shrink-0"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={{ opacity: closing ? 0 : 1, y: 0 }}
          transition={closing ? { duration: 0.15 } : { duration: 0.45, delay: 0.2, ease: EASE_OUT }}
        >
          <div className="relative">
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={project.slug}
              custom={direction}
              variants={text}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <h2 className="font-medium">{project.title}</h2>
              {details.map(d => <p key={d} className="text-[#8d8d8d]">{d}</p>)}
              {project.description && <p className="mt-4">{project.description}</p>}
              <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1">
                <Link href={project.href} {...linkTarget(project.href)} onClick={e => onCaseStudy(e, project.href)} className={inlineLink}>{project.cta}</Link>
                {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className={inlineLink}>Visit site</a>}
              </p>
            </motion.div>
          </AnimatePresence>
          </div>

          {projects.length > 1 && (
            <div className="mt-8 flex items-center gap-1 text-[#8d8d8d]">
              <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous project"
                className="h-9 w-9 -ml-2 grid place-items-center rounded-full hover:bg-neutral-100 hover:text-[#2a2a2a] disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:bg-neutral-100 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <span className="text-[13px] font-[450] tabular-nums min-w-[3.5ch] text-center" aria-live="polite">{index + 1} / {projects.length}</span>
              <button type="button" onClick={() => go(1)} disabled={index === projects.length - 1} aria-label="Next project"
                className="h-9 w-9 grid place-items-center rounded-full hover:bg-neutral-100 hover:text-[#2a2a2a] disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:bg-neutral-100 transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ---------- Device mockups ---------- */

// Laptops for wide screenshots, phones for tall ones; without an image, a phone.
// In the project view (`zoomed`) the device fills its frame and follows the flight transform.
function DeviceMock({ project, index, zoomed = false, revealed = true, initialAspect, onAspect, rootRef, flight }: {
  project: ReelItem;
  index: number;
  zoomed?: boolean;
  /** Whether it has entered; its screen content settles and its interface plays once it has */
  revealed?: boolean;
  initialAspect?: number;
  onAspect?: (slug: string, aspect: number) => void;
  rootRef?: (el: HTMLDivElement | null) => void;
  flight?: { x: MotionValue<number>; y: MotionValue<number>; scale: MotionValue<number> };
}) {
  const src = projectImage(project);
  const [aspect, setAspect] = useState<number | null>(initialAspect ?? null);
  const device: Device = aspect ? (aspect < 0.85 ? 'phone' : 'laptop') : 'phone';
  const { slug } = project;
  const reportAspect = useCallback((a: number) => {
    setAspect(a);
    onAspect?.(slug, a);
  }, [onAspect, slug]);
  const animated = ANIMATED_SCREENS[project.slug];
  // Counter-motion: as the phone glides in, its screen content settles from slightly larger,
  // a touch behind the frame, for depth
  const screen = (
    <motion.div
      className="absolute inset-0"
      initial={false}
      animate={{ scale: revealed ? 1 : 1.06 }}
      transition={revealed ? { duration: 1.1, ease: [0.05, 0.7, 0.1, 1] } : { duration: 0 }}
    >
      <Screen src={src} animated={animated} active={revealed} index={index} device={device} ready={initialAspect !== undefined} onAspect={reportAspect} />
    </motion.div>
  );

  if (project.book) {
    // Case study book (components/CaseStudyBook.tsx, 116×132), with the project's title on its cover
    return (
      <motion.div ref={rootRef} style={flight} className={`relative ${zoomed ? 'h-[min(100%,99vw)] md:h-[90%]' : 'h-[min(560px,76vw)] max-h-[85%] md:h-[85%]'} aspect-[116/132]`}>
        <CaseStudyBook title={project.title} />
      </motion.div>
    );
  }

  if (device === 'phone') {
    // iPhone 16 Pro Max frame (public/mockups/iphone-16-pro-max.png, 772×1600) with a see-through
    // screen; the shot sits underneath, inset and rounded to match the screen's opening.
    return (
      <motion.div ref={rootRef} style={flight} className={`relative ${zoomed ? 'h-full' : 'h-[min(684px,90vw)] max-h-[96%] md:h-[96%]'} aspect-[772/1600]`}>
        {/* A square screen under the frame: the frame is opaque outside its screen opening, so it shapes
            the corners and the opening is always filled. Masked to the phone's outline as a safeguard, over
            a black backing so any sub-pixel sliver between screen and frame reads as bezel, not page. */}
        <div className="absolute inset-0 bg-black" style={PHONE_MASK}>
          <div className="absolute inset-x-[3.83%] inset-y-[1.52%] overflow-hidden bg-white">{screen}</div>
        </div>
        <Image src="/mockups/iphone-16-pro-max.png" alt="" aria-hidden="true" draggable={false} fill sizes="(max-width: 768px) 50vw, 340px" priority={index < 2} className="pointer-events-none select-none" />
      </motion.div>
    );
  }

  return (
    // MacBook Pro frame (public/mockups/macbook-pro.svg, viewBox 520×290) with a see-through 16:10
    // screen; the shot sits underneath, inset to the opening, and the notch draws over it.
    <motion.div ref={rootRef} style={flight} className={`relative ${zoomed ? 'h-[min(100%,48.8vw)] md:h-[min(100%,31.2vw)]' : 'w-[calc(100vw-72px)] md:w-auto md:h-full'} aspect-[520/290]`}>
      <div className="absolute inset-x-[10.385%] top-[2.069%] bottom-[9.138%] overflow-hidden isolate bg-white [border-radius:1.21%_1.21%_0.36%_0.36%/1.94%_1.94%_0.58%_0.58%] [clip-path:inset(0_round_1.21%_1.21%_0.36%_0.36%/1.94%_1.94%_0.58%_0.58%)]">{screen}</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mockups/macbook-pro.svg" alt="" aria-hidden="true" draggable={false} className="absolute inset-0 w-full h-full pointer-events-none select-none" />
    </motion.div>
  );
}

// The device screen: the project image when it loads, otherwise placeholder screen artwork
function Screen({ src, animated, active = true, index, device, ready = false, onAspect }: {
  src: string; animated?: AnimatedScreenSpec; active?: boolean; index: number; device: Device; ready?: boolean; onAspect: (a: number) => void;
}) {
  // `ready`: the image already loaded in the reel, so the project view shows it straight away
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>(src || animated ? (ready || animated ? 'loaded' : 'loading') : 'failed');
  const wrapRef = useRef<HTMLDivElement>(null);
  // Images can finish before hydration, when onLoad/onError aren't attached yet
  useEffect(() => {
    if (animated) {
      onAspect(animated.width / animated.height);
      return;
    }
    const frame = requestAnimationFrame(() => {
      const img = wrapRef.current?.querySelector<HTMLImageElement>('img[data-project-image]');
      if (!img?.complete) return;
      if (img.naturalWidth > 0) {
        setState('loaded');
        onAspect(img.naturalWidth / img.naturalHeight);
      } else {
        setState('failed');
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [onAspect, animated]);

  const sizes = device === 'laptop' ? '(max-width: 768px) 80vw, 720px' : '(max-width: 768px) 40vw, 260px';

  // A project with an animated screen plays its interface instead of showing a still
  if (animated) return <div ref={wrapRef} className="absolute inset-0"><AnimatedScreen screen={animated} sizes={sizes} active={active} /></div>;

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {state !== 'failed' && src && (
        <Image
          src={src}
          alt=""
          data-project-image
          fill
          sizes={sizes}
          priority={index < 2}
          onLoad={e => {
            const img = e.currentTarget;
            setState('loaded');
            if (img.naturalHeight) onAspect(img.naturalWidth / img.naturalHeight);
          }}
          onError={() => setState('failed')}
          className={`object-cover object-top transition-opacity duration-300 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
