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
      {/* Three-line navigation opens a full-height drawer from the right. */}
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
          className="pointer-events-auto absolute z-50 top-4 right-3 md:top-6 md:right-6 h-11 w-11 grid place-items-center rounded-full text-[#2a2a2a] hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a2a2a] transition-colors"
        >
          <span className="relative block h-5 w-5" aria-hidden="true">
            {menu ? (
              <>
                <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current" />
                <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-current" />
              </>
            ) : (
              <>
                <span className="absolute left-0 top-[3px] h-[1.5px] w-full bg-current" />
                <span className="absolute left-0 top-[9px] h-[1.5px] w-full bg-current" />
                <span className="absolute left-0 top-[15px] h-[1.5px] w-full bg-current" />
              </>
            )}
          </span>
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
