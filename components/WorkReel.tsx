'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion';
import type { SiteConfig } from '@/lib/content-model';
import { isExternal, type ReelItem, type ReelSection } from '@/lib/reel';
import CaseStudyBook from './CaseStudyBook';
import { NowPlayingContent, useNowPlaying } from './NowPlaying';
import AnimatedScreen from './AnimatedScreen';
import { ANIMATED_SCREENS, type AnimatedScreen as AnimatedScreenSpec } from '@/lib/screen-animations';


// Stroke-only drawings: preserve the hand-drawn SVG paths, never mask a filled rectangle.
const xSocialPaths = ["M23.2336 16.1612C26.9408 16.1612 35.4338 16.8455 39.3771 19.6792C44.7939 23.5718 49.5652 29.2449 53.5059 33.7374C59.5934 40.6774 62.5576 46.6148 65.22 50.8325C66.1898 52.3688 68.3016 55.312 71.9235 60.8116C80.5356 73.8881 82.4562 76.6191 84.2711 78.8107C84.7533 79.393 85.2665 79.9365 85.2394 80.3043C85.2124 80.672 84.6488 80.831 84.0894 80.8137C81.2038 80.724 77.3815 79.8334 73.3537 79.5896C67.3413 79.2256 62.8358 79.2748 61.6602 78.5647C58.8612 76.8739 57.6401 74.6506 55.2246 71.1768C53.4566 68.6344 51.3156 66.2673 49.3397 63.9214C46.9657 61.1027 41.587 51.8183 37.0642 43.1911C35.0488 39.3468 33.3462 36.9885 28.2028 28.8623C25.5393 24.1653 24.7181 22.1046 23.5653 19.8857C23.2904 19.3379 23.0932 18.8367 22.3492 18.0824","M22.3837 74.3812C22.4011 74.3631 22.4186 74.3449 26.912 70.8159L27.0607 70.6992C31.6009 67.1335 40.4531 60.1814 47.5865 54.1798C54.7987 48.1119 59.9822 43.229 62.9085 40.4287C67.396 36.1344 69.2455 34.528 72.4817 31.3617C74.8611 29.0336 76.6461 26.3759 78.1503 24.6771C79.5569 22.7869 81.0793 21.1563 82.5588 19.6408C82.9299 19.2566 83.3023 18.8816 83.6859 18.4952"];
const instagramSocialPaths = ["M18.3908 29.5261V35.9147V35.9147C18.3908 42.1994 18.3908 54.7151 18.5424 61.5752C18.7125 69.2721 19.5532 70.5508 20.0703 71.4408C21.3323 73.6129 24.4942 75.9146 26.5541 77.0474C28.7166 78.2365 30.898 78.4528 32.7421 78.6956C35.0198 78.9955 37.5641 79.568 39.1892 79.6793C41.7058 79.8517 43.9903 80.2749 45.841 80.4184C48.6513 80.6363 51.455 80.6943 55.6905 80.8894C62.0694 81.1832 67.603 80.6738 69.808 80.2267C72.6011 79.6604 74.8798 77.9209 75.9691 76.7262C77.5899 74.9484 78.0894 70.501 81.0455 62.5403C82.3489 59.0303 82.3133 53.4409 82.3497 47.1804C82.3793 42.0868 81.7155 39.4432 81.6397 37.1643C81.5778 35.302 80.9134 32.7913 80.1091 30.6193C79.8347 29.8783 78.4669 27.6429 76.5933 24.5808L76.4002 24.2652C74.9477 21.8912 71.8001 22.2656 67.2403 20.7616C63.5587 19.5472 57.1559 17.2506 53.6113 16.0092C49.5911 14.6011 48.6873 14.3548 45.9459 14.1832C33.5153 13.4054 29.6866 15.327 27.9995 15.7904C26.326 16.2501 23.9408 17.8131 22.1195 19.1981C20.8075 20.1958 20.0304 21.8254 19.3265 23.2698L19.3166 23.2873C19.1244 23.6282 18.93 23.9729 18.3882 25.5057C17.837 27.0648 16.9322 29.8431 16 32.7056","M45.4483 38.2356C45.1584 38.6336 44.1232 41.1494 43.1896 43.5501C42.3764 45.641 41.8583 49.0234 41.7072 51.4124C41.5086 54.5536 43.2829 57.0645 44.7178 59.4548C45.6104 60.9417 48.7228 61.4322 52.3357 62.1039C55.7509 62.7388 58.7337 61.8956 60.0905 61.3021C62.1767 60.3896 62.888 57.6346 63.1736 55.9997C63.6006 53.5555 63.4784 51.1646 63.2988 48.3267C63.0538 44.4539 59.9569 42.3731 58.1691 40.5879C56.4068 38.8281 55.0411 38.073 52.892 37.5425C51.9525 37.428 50.9522 37.2872 49.879 37.0961C49.3807 37.0257 48.9764 37.009 48.0529 36.8921","M67.7139 33.6995V33.7472"];
const linkedinSocialPaths = ["M30.7015 35.9343C30.7015 35.9791 30.7015 45.0952 30.6356 59.2141C30.4377 64.9236 30.3001 66.6355 30.2644 69.0384C30.2303 70.4337 30.1639 72.1861 30.2522 73.7852","M30.2339 22.3048V23.1276","M46.998 74.655C46.998 73.3769 46.829 69.2959 46.742 44.8374C46.728 40.9072 46.742 43.1897 46.8946 44.6707C47.0471 46.1516 47.3523 46.7619 47.7034 46.7992C49.8454 47.0265 50.0037 42.5964 52.1528 40.5687C54.9533 37.9263 62.7999 37.9113 66.6812 38.7238C69.4261 39.2983 69.1555 43.933 70.1812 46.8995C71.1361 49.6615 71.83 52.5139 72.5963 56.1477C73.8133 61.9187 73.72 67.7952 74.6191 70.8651C75.2369 72.3129 75.8623 73.6199 76.4494 74.84C76.7502 75.4628 77.0571 76.0929 77.9113 77.6772","M45.0546 35.4772C45.0546 37.0648 45.3063 41.5741 45.965 44.4411C46.2673 45.8478 46.5464 47.2885 46.798 48.7446C46.9134 49.4749 47.004 50.1877 47.0972 52.3588"];

interface WorkReelProps {
  config: SiteConfig;
  sections: ReelSection[];
}

// Text column width and its left edge; the reel starts on the same edge
const COLUMN = 520;
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
function SidebarNowPlaying() {
  const data = useNowPlaying();
  return (
    <section aria-label="Spotify now playing" className="mt-5 border-t border-black/10 pt-2">
      <NowPlayingContent data={data} showImage />
    </section>
  );
}

export default function WorkReel({ config, sections }: WorkReelProps) {
  // The section the reel shows (Work); the projects in it make the row above the reel
  const tab = 0;
  // The ⋯ menu in the top-right corner
  const [menu, setMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const section = sections[tab] ?? sections[0];
  const projects = section.items;
  const hasItems = projects.length > 0;
  // Each screen scrolls independently instead of cycling within a project stack.
  const stacks = projects.map((item, index) => ({ first: index, screens: [item] }));

  // Items that have slid into view (each enters once)
  const [revealed, setRevealed] = useState<Set<string>>(() => new Set());
  const itemKey = (p: ReelItem) => `${section.id}:${p.slug}`;
  const projectRow = projects.map((p, i) => ({ slug: p.slug, title: p.title, first: i }));
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
  const current = stacks[active]?.screens[0];
  const currentProject = current?.slug;
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
      const distance = atEnd && i === stacks.length - 1 ? -1
        : Math.abs((centred ? r.left + r.width / 2 : r.left + Math.min(r.width, 200) / 2) - anchorX);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    });
    setView(v => (v.active === best ? v : { active: best, dir: best > v.active ? 1 : -1 }));
  }, [stacks.length]);

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
    if (!reel || reduceMotion || stacks.length < 2 || zoom) return;
    let paused = false;
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      if (!paused && !document.hidden) {
        const current = viewIndex.current;
        // Continue forward into a duplicate of the first project, then silently
        // reposition to the real first project after the slide has finished.
        const next = (current + 1) % stacks.length;
        viewIndex.current = next;
        if (next === 0) {
          const clone = reel.querySelector<HTMLElement>('[data-reel-loop-clone]');
          const first = itemRefs.current[0];
          if (clone && first) {
            const centred = window.matchMedia('(max-width: 767px)').matches;
            const anchor = () => centred
              ? reel.getBoundingClientRect().left + reel.clientWidth / 2
              : (columnRef.current?.getBoundingClientRect().left ?? 0);
            const position = (el: HTMLElement) => {
              const rect = el.getBoundingClientRect();
              return centred ? rect.left + rect.width / 2 : rect.left;
            };
            // Scroll forward to the duplicate first project. Do not allow
            // scroll-snap to pull the viewport backwards during the handoff.
            const previousSnap = reel.style.scrollSnapType;
            const previousBehavior = reel.style.scrollBehavior;
            reel.style.scrollSnapType = 'none';
            reel.style.scrollBehavior = 'auto';
            let finished = false;
            let fallback: ReturnType<typeof setTimeout>;
            const finish = () => {
              if (finished || !reel.isConnected) return;
              finished = true;
              clearTimeout(fallback);
              reel.removeEventListener('scrollend', finish);
              // The duplicate and original are visually identical. Jump
              // invisibly to the original before enabling snapping again.
              reel.scrollLeft += position(first) - anchor();
              setView({ active: 0, dir: 1 });
              requestAnimationFrame(() => {
                reel.style.scrollSnapType = previousSnap;
                reel.style.scrollBehavior = previousBehavior;
              });
            };
            reel.addEventListener('scrollend', finish, { once: true });
            reel.scrollTo({ left: reel.scrollLeft + position(clone) - anchor(), behavior: 'smooth' });
            // Browsers without scrollend still finish the forward-only loop.
            fallback = setTimeout(finish, 1800);
          }
        } else {
          scrollToItem(next);
        }
      }
      timer = setTimeout(advance, 6300);
    };
    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    timer = setTimeout(advance, 6300);
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
  }, [stacks.length, reduceMotion, zoom]);

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
    const next = Math.min(stacks.length - 1, Math.max(0, active + (e.key === 'ArrowRight' ? 1 : -1)));
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
        className="absolute inset-0 z-40 pointer-events-none md:hidden"
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
          className="pointer-events-auto absolute z-50 top-3 left-3 md:top-4 h-14 w-14 grid place-items-center rounded-full text-[#2a2a2a] hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2a2a2a] transition-colors"
        >
          <span className={`block h-[42px] w-[42px] transition-transform duration-300 ${menu ? 'rotate-45' : ''}`} aria-hidden="true">
            <img src="/plus-figma.svg" alt="" className="block h-full w-full" />
          </span>
        </button>
        <AnimatePresence>
          {menu && (
            <>
              <motion.button
                type="button"
                aria-label="Close navigation"
                className="pointer-events-auto absolute inset-0 bg-black/[0.045] backdrop-blur-[1px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setMenu(false)}
              />
              <motion.nav
                id="portfolio-side-menu"
                aria-label="Main navigation"
                className="pointer-events-auto absolute inset-y-0 left-0 w-[70%] bg-white pl-4 pr-8 md:px-12 pt-28 pb-12 overflow-y-auto flex flex-col shadow-[1px_0_2px_rgba(0,0,0,0.04)]"
                initial={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
                animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
                transition={reduceMotion ? { duration: 0.15 } : { type: 'spring', stiffness: 300, damping: 34 }}
              >
                
                <div>
                  {menuGroups[0]?.map(item => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMenu(false)}
                      className="flex items-center gap-4 py-3 text-[22px] leading-8 tracking-[-0.025em] font-medium text-[#252525] hover:text-[#777] focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                    >
                      <svg viewBox="0 0 100 100" width="40.2" height="40.2" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
                        {({ Writing: ["M35.3768 50.1233C37.051 50.1233 41.3383 49.9446 44.4572 49.6372C46.4821 49.2423 45 49.5 47.5 49C47.9971 48.9006 49.5 49 54 48.5","M20 42.9128C20 42.8108 20 38.0848 20.1358 30.3062C20.247 23.9345 22.027 22.0245 23.8418 19.6254C24.8472 18.2961 27.1095 17.9498 33.0088 15.6727C35.5666 14.6853 39.8936 14.0448 47.4198 14.0003C49.8308 13.9861 51.0203 14.4367 54.8585 14.5616C58.3505 14.6752 64.9828 14.6972 68.5979 14.713C73.5958 14.7348 75.4298 14.8992 76.6573 15.5294C77.9486 16.1923 78.9919 18.7905 79.986 22.0306C80.2872 23.0126 80.2999 24.3564 80.3693 31.7106L80.3724 32.0373C80.4446 39.6788 80.4446 53.5837 80.3911 61.0908C80.3202 71.0436 79.6977 73.8375 79.1877 75.8229C78.2208 79.5868 73.9129 81.2623 70.6915 82.927C69.7002 83.4392 68.0894 83.6136 63.8467 84.0729L63.6661 84.0924C60.3962 84.4465 54.9945 84.9997 48.8814 85.2888C42.7683 85.5778 36.1066 85.5778 32.4407 85.5475C27.5053 85.5067 25.5728 84.2786 23.9548 83.1956C22.0943 81.9504 21.3649 78.2641 20.7171 71.1998C20.4358 65.1854 20.2509 54.2382 20.1709 48.2534C20.091 42.2685 20.1217 41.5777 20.1533 40.866","M33.5314 34.0619C33.9921 34.1121 36.6324 33.6895 38.5544 33.31C40.5582 32.9144 42.7351 31.9301 48.852 29.5601C53.1027 28.3421 56.5106 28.2049 59.9387 28.7652C60.6935 28.9046 61.5178 28.9655 62.3671 29.0283","M35 67.5171C36.0516 67.5171 40.2343 67.1605 45.4402 67C47.7452 67.2543 49.3759 67.5645 50.4701 67.5977C50.9571 67.5987 51.3059 67.5671 51.6651 67.5347","M47.8192 48.248C50.7647 48.248 57.3213 48.0863 59.0797 47.7987C60.6013 47.5498 61.5526 45.7126 62.6965 44.8062C62.9953 44.6304 63.2967 44.5172 63.3446 44.5901C63.3925 44.663 63.1777 44.9255 62.4199 45.4321"], Illustration: ["M37.9746 26.9843C37.9847 23.7176 38.0978 16.6256 38.6518 15.6739C38.7861 15.4432 39.0507 15.3615 42.6045 15.2867C46.1584 15.2119 53.0486 15.1886 56.7335 15.1913C61.3709 15.1947 62.6422 15.6555 63.6009 16.152C63.8583 16.2853 64.0134 16.5902 64.1814 16.8302C64.3495 17.0701 64.4904 17.2892 64.5414 19.4262C64.5925 21.5631 64.5492 25.6113 64.5047 29.7821V29.7822","M40.8078 32.4027C40.8725 32.4027 40.9372 32.4027 43.8761 32.4173C46.815 32.4318 52.6262 32.4609 55.7533 32.4906C59.8212 32.5293 61.6141 32.6254 62.9677 32.7341C63.2355 32.7556 63.4716 32.7833 63.472 32.7174C63.4723 32.6516 63.2293 32.4965 63.0163 32.3288C62.8034 32.1612 62.6278 31.9856 62.4469 31.8047L62.4468 31.8047","M46.6183 48.5767C46.8751 48.6257 47.8145 48.9303 48.9961 49.5205C50.9458 50.4943 51.6764 51.1801 53.3106 51.1691C55.0234 51.1576 56.1524 49.422 57.2149 48.2588C57.4942 47.9402 57.7921 47.6102 58.0208 47.3439C58.2495 47.0777 58.3999 46.8852 58.6627 46.4111","M38.1074 26.4622C38.3648 27.2176 39.1068 30.1026 39.2642 32.6526C39.6397 38.7367 38.7502 40.9548 38.2471 42.6721C37.7054 44.5214 36.7037 46.1921 35.4763 48.6438C33.7119 52.1678 33.2828 53.2768 33.3004 54.8386C33.3214 56.6943 34.6126 58.5054 35.965 60.2801C38.7648 63.9544 40.8705 65.8628 43.3085 68.6951C44.3056 69.8534 45.7109 71.6559 47.3128 74.1171C50.4629 78.957 51.6647 81.3372 52.8288 83.1886C53.1301 83.6677 53.6922 84.3182 54.0509 84.561C55.6746 85.6604 56.9065 80.3968 58.148 78.0207C59.2398 75.931 61.1015 71.9608 62.1634 69.7986C64.0823 65.8912 65.8205 63.2235 66.7063 61.66{['X', 'Instagram', 'LinkedIn'].includes(item.label) ? (
                          <svg aria-hidden="true" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className={item.label === 'LinkedIn' ? 'h-[36.96px] w-[36.96px]' : 'h-[33.6px] w-[33.6px]'}>
                            {(item.label === 'X' ? xSocialPaths : item.label === 'Instagram' ? instagramSocialPaths : linkedinSocialPaths).map((d, index) => <path key={index} d={d} />)}
                          </svg>
                        68 28.282 38.0595 29.6217 38.6454C30.868 39.1905 31.6894 40.3497 33.5796 42.348C35.2978 44.1645 35.8757 44.9745 36.3547 45.3298C36.6666 45.5611 36.8576 42.912 37.0522 38.4745C37.2805 33.2712 38.1959 29.1241 38.5815 26.6863C39.0846 23.5057 39.1113 21.0213 39.3497 19.1984C39.5541 17.6357 41.3425 15.8948 42.8654 15.0363C43.3934 14.7386 44.0298 15.0296 44.5607 15.31C45.6754 15.8987 46.9815 19.4737 47.9538 24.629C49.0307 30.3391 48.414 34.4742 48.2642 35.134C47.9509 36.5134 47.6679 38.5666 47.3139 40.5173C47.2145 41.0646 47.9343 38.6062 48.8691 35.1403C49.415 33.1165 50.1801 31.3319 50.9879 30.3841C51.3452 29.9649 51.988 29.8383 52.6845 29.8293C53.4062 29.82 54.0228 30.2933 54.5004 30.7138C55.4002 31.5058 55.8044 34.1122 56.1281 35.8358C56.3533 37.035 56.3686 38.7301 56.5864 40.2905C56.9474 42.8763 57.6703 34.723 58.3754 33.1284C58.9695 31.7847 59.9713 30.6096 60.9809 30.0379C61.4616 29.7656 62.2524 29.9235 63.1721 30.2944C64.6706 30.8988 65.5381 33.2795 66.0215 35.5233C66.3947 37.2554 66.1587 38.6511 66.2634 38.7997C67.4278 40.4519 67.5589 34.7189 68.7231 32.6143C69.1037 31.9264 69.5608 31.5148 70.1093 31.1296C71.4396 30.1957 74.2011 31.0747 75.2909 31.7903C75.7343 32.0815 75.5605 33.3771 75.7544 35.5727C76.0594 39.0271 75.4981 42.6042 75.0276 45.4811C74.5798 48.2189 74.6462 49.9318 74.5876 52.6456C74.5356 55.0516 74.5677 59.5485 74.3794 62.92C73.8147 68.402 73.3238 70.8841 73.0595 71.4819C72.8982 71.772 72.6818 72.0354 72.3355 72.5383","M30.6364 63.5112C31.1357 65.7598 34.3688 73.5988 35.5864 77.4612C36.0727 79.0039 37.836 83.7062 40.0864 85.1112C41.5267 86.0104 46.1407 83.6153 50.4364 83.3112C53.0092 83.129 53.5083 82.7787 55.8364 82.4112C59.3732 81.8528 55.5158 82.48 59.4364 82.4112C62.6303 82.355 67.6589 80.6317 68.8864 79.7112C70.6864 78.3612 71.1165 77.273 71.4779 76.1112C71.6579 75.4364 72.3079 71.1346 72.4864 70.2612"] } as Record<string, string[]>)[item.label]?.map((d, index) => (<path key={index} d={d} />))}
                      </svg>
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
                <div className="mt-auto pt-10 flex flex-wrap items-center justify-start gap-3 -ml-2" aria-label="Social links">
                  {socials.filter(item => item.label !== 'GitHub' && item.label !== 'Email').map(item => {
                    
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        {...(isExternal(item.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        aria-label={item.label}
                        title={item.label}
                        onClick={() => setMenu(false)}
                        className="inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl text-gray-400 hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-colors"
                      >
                        {['X', 'Instagram', 'LinkedIn'].includes(item.label) ? (
                          <span
                            aria-hidden="true"
                            className={`block bg-current ${item.label === 'LinkedIn' ? 'h-[36.96px] w-[36.96px]' : 'h-[33.6px] w-[33.6px]'}`}
                            style={{
                              maskImage: `url(${item.label === 'X' ? '/social-x.svg' : item.label === 'Instagram' ? '/social-instagram.svg' : '/social-linkedin.svg'})`,
                              maskSize: 'contain',
                              maskRepeat: 'no-repeat',
                              maskPosition: 'center',
                            }}
                          />
                        ) : (
                          <svg width="21" height="21" viewBox="0 0 24 24" fill={item.label === 'GitHub' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            {item.label === 'GitHub' ? (
                              <path stroke="none" d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.82 2.1 3.25 1.5.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.16a10.7 10.7 0 0 1 5.6 0c2.13-1.45 3.07-1.16 3.07-1.16.62 1.55.23 2.7.12 2.98.72.79 1.15 1.8 1.15 3.03 0 4.32-2.63 5.27-5.14 5.55.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.78.54A11.2 11.2 0 0 0 12 .8Z" />
                            ) : (
                              <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m3 6 9 7 9-7" /></>
                            )}
                          </svg>
                        )}
                      </a>
                    );
                  })}
                </div>
                <SidebarNowPlaying />
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.header
        className="w-full max-w-[520px] mx-auto px-6 md:px-0 pt-28 md:pt-32"
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
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {email && (
                <a href={email} aria-label="Send email" className="inline-flex h-9 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#487cff] to-[#2b64f8] px-3 text-sm font-medium tracking-[-0.01em] text-white shadow-[0_1px_1px_rgba(20,31,87,0.2),0_2px_4px_-2px_rgba(20,31,87,0.4),0_0_0_1px_#2b64f8,inset_0_1px_0.5px_rgba(255,255,255,0.13)] transition-[background,box-shadow] duration-200 hover:bg-[#3e71f6] active:bg-[#2658e9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#2b64f8]">Send email</a>
              )}
              <a href="#case-studies" className="inline-flex h-9 items-center justify-center rounded-[10px] bg-white px-3 text-sm font-medium tracking-[-0.01em] text-[#525252] shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)] transition-colors hover:bg-neutral-50 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#2b64f8]">See case studies</a>
            </div>
          </div>


        </div>
      </motion.header>


      {projects.length > 0 && (
        <motion.section
          id="case-studies"
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
            className="[--reel-padding:24vw] md:[--reel-padding:max(1.5rem,calc((100vw-520px)/2))] w-full h-[min(700px,92vw)] max-h-full md:h-[min(520px,42vw)] flex items-end gap-[2vw] md:gap-6 overflow-x-auto overflow-y-hidden hide-scrollbar overscroll-x-contain focus-visible:outline-none snap-x snap-mandatory"
            // Same left edge as the text column
            style={{ paddingLeft: "var(--reel-padding, 24vw)", paddingRight: "var(--reel-padding, 16vw)", scrollPaddingLeft: "var(--reel-padding, 16vw)", scrollPaddingRight: "var(--reel-padding, 16vw)" }}
          >
            {stacks.map((stack, i) => (
              <div
                key={stack.screens[0].slug}
                role="listitem"
                ref={el => { itemRefs.current[i] = el as unknown as HTMLAnchorElement; }}
                className="shrink-0 h-full flex items-end snap-center md:snap-start"
              >
                <ProjectScreenStack
                  screens={stack.screens}
                  onOpen={screen => {
                    const flatIndex = stack.first + screen;
                    const device = itemRefs.current[i]?.querySelector('[data-stack-front]');
                    if (!device) return;
                    setLeaving(false);
                    window.history.pushState({ portfolioProjectOverlay: true }, '', window.location.href);
                    historyOverlayRef.current = true;
                    setZoom({ index: flatIndex, origin: device.getBoundingClientRect(), aspects: new Map(aspects.current) });
                  }}
                  onAspect={recordAspect}
                  reduceMotion={!!reduceMotion}
                />
              </div>
            ))}
            {stacks.length > 1 && (
              <div data-reel-loop-clone aria-hidden="true" className="shrink-0 h-full flex items-end snap-center md:snap-start pointer-events-none">
                <ProjectScreenStack
                  screens={stacks[0].screens}
                  onOpen={() => {}}
                  onAspect={() => {}}
                  reduceMotion={!!reduceMotion}
                />
              </div>
            )}
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

/* One device per project, cycling through its screens like a gentle animated GIF. */
function ProjectScreenStack({ screens, onOpen, onAspect, reduceMotion }: {
  screens: ReelItem[];
  onOpen: (screen: number) => void;
  onAspect: (slug: string, aspect: number) => void;
  reduceMotion: boolean;
}) {
  const [front, setFront] = useState(0);
  useEffect(() => {
    if (screens.length < 2 || reduceMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setFront(n => (n + 1) % screens.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [screens.length, reduceMotion]);

  return (
    <div className="relative h-full w-[52vw] md:w-[min(400px,34vw)] flex flex-col items-center justify-end">
      <span className="absolute top-8 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-full bg-white px-3 h-7 flex items-center justify-center text-[12px] font-medium text-[#252525] shadow-[0_2px_6px_rgba(0,0,0,0.10)] ring-1 ring-black/[0.04]">
        {screens[0].title}
      </span>
      <div className="relative w-full h-[calc(100%-64px)]">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={screens[front].id}
            data-stack-front=""
            className="absolute inset-0 flex items-end justify-center cursor-pointer"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.55, ease: EASE_OUT }}
            onClick={() => onOpen(front)}
          >
            <DeviceMock project={screens[front]} index={front} onAspect={onAspect} revealed />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
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
