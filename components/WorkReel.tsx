'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion';
import type { Project, SiteConfig } from '@/lib/content-model';
import { reelPlaceholder } from '@/lib/mockups';
import Newspaper from './Newspaper';

interface WorkReelProps {
  config: SiteConfig;
  projects: Project[];
}

// Text column width and its left edge; the reel starts on the same edge
const COLUMN = 625;
const GUTTER = `max(1.5rem, calc((100vw - ${COLUMN}px) / 2))`;

// Stand-ins for the empty reel: no images, so each device shows its placeholder screen artwork
const PLACEHOLDER_PROJECTS: Project[] = Array.from({ length: 6 }, (_, i) => ({
  id: `placeholder-${i}`, slug: `placeholder-${i}`, title: '', description: '',
}));

const projectImage = (p: Project) => p.preview || p.previewImages?.[0] || p.avatar || '';
// Projects tagged `case-study` show as a folded newspaper instead of a device
const isNewspaper = (p: Project) => p.tags?.includes('case-study') ?? false;

// Ayomide-style inline link: same size and colour as the text, dotted underline
const inlineLink = 'underline decoration-dotted decoration-[#b2b2b2] decoration-1 underline-offset-4 hover:decoration-[#2a2a2a] transition-colors';

type Device = 'laptop' | 'phone';

// Springs after mikematas.com, tuned by feel: the device eases out of the reel with a hint of
// bounce and settles back into its slot without overshooting; paging glides with a little give
const OPEN_SPRING = { type: 'spring', visualDuration: 0.5, bounce: 0.14 } as const;
const CLOSE_SPRING = { type: 'spring', visualDuration: 0.42, bounce: 0, restDelta: 0.002, restSpeed: 0.02 } as const;
const PAGE_SPRING = { type: 'spring', visualDuration: 0.5, bounce: 0.08 } as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
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
export default function WorkReel({ config, projects }: WorkReelProps) {
  const reelRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // The project in view, and which way the reel last moved (for the title swap)
  const [view, setView] = useState({ active: 0, dir: 1 });
  const { active, dir } = view;
  const [departing, setDeparting] = useState(false);
  const router = useRouter();
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const [leaving, setLeaving] = useState(false);
  const zoomRef = useRef<Zoom | null>(null);
  const aspects = useRef(new Map<string, number>());
  const quietFocus = useRef(false);
  const returnFocus = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const current = projects[active];
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
  const recordAspect = useCallback((slug: string, a: number) => { aspects.current.set(slug, a); }, []);

  // The project nearest the column's left edge is the one "in view"
  const measure = useCallback(() => {
    const reel = reelRef.current;
    if (!reel || projects.length === 0) return;
    const anchorX = (columnRef.current?.getBoundingClientRect().left ?? 0) + 80;
    const atEnd = reel.scrollLeft + reel.clientWidth >= reel.scrollWidth - 4;
    let best = 0;
    let bestDistance = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const distance = atEnd && i === projects.length - 1 ? -1 : Math.abs(r.left + Math.min(r.width, 200) / 2 - anchorX);
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
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    reel.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      reel.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [measure]);

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
  }, []);

  const scrollToItem = (i: number) => {
    const el = itemRefs.current[i];
    const reel = reelRef.current;
    if (!el || !reel) return;
    const edge = columnRef.current?.getBoundingClientRect().left ?? 0;
    reel.scrollTo({ left: reel.scrollLeft + el.getBoundingClientRect().left - edge, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Zoom a device out of the reel, from exactly where it sits
  const openAt = (i: number) => {
    const device = itemRefs.current[i]?.firstElementChild;
    if (!device) return;
    setLeaving(false);
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
    return el.firstElementChild?.getBoundingClientRect() ?? null;
  };

  // Leave for a case study: fade the page out, then navigate, so the case study rises in after it.
  // Modified clicks still open it in a new tab or window.
  const leaveFor = (e: React.MouseEvent, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    if (reduceMotion) { router.push(href); return; }
    setDeparting(true);
    setTimeout(() => router.push(href), DEPART_MS);
  };

  const onZoomClosed = (i: number) => {
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

  // Title swap and counter roll; `d` is the direction the reel moved
  const swap = {
    enter: (d: number) => (reduceMotion ? { opacity: 0 } : { opacity: 0, y: d * 8, filter: 'blur(3px)' }),
    center: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.38, ease: EASE_OUT } },
    exit: (d: number) => (reduceMotion
      ? { opacity: 0, transition: { duration: 0.15 } }
      : { opacity: 0, y: d * -8, filter: 'blur(3px)', transition: { duration: 0.2, ease: EASE_OUT } }),
  };
  const roll = {
    enter: (d: number) => ({ opacity: 0, y: reduceMotion ? 0 : d * 10 }),
    center: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
    exit: (d: number) => ({ opacity: 0, y: reduceMotion ? 0 : d * -10, transition: { duration: 0.2, ease: EASE_OUT } }),
  };

  return (
    // Opacity only on the root: a transform here would move the fixed project view
    <motion.div
      className="min-h-dvh md:h-dvh flex flex-col bg-white text-[14px] leading-6 text-[#2a2a2a] font-sans"
      initial={false}
      animate={{ opacity: departing ? 0 : 1 }}
      transition={{ duration: DEPART_MS / 1000, ease: EASE_OUT }}
    >
      <motion.header
        className="w-full max-w-[625px] mx-auto px-6 md:px-0 pt-12 md:pt-[72px]"
        animate={reduceMotion ? { opacity: dimmed ? 0 : 1 } : { opacity: dimmed ? 0 : 1, scale: dimmed ? 0.985 : 1 }}
        transition={{ duration: dimmed ? 0.25 : 0.45, delay: dimmed ? 0 : 0.08, ease: EASE_OUT }}
        aria-hidden={zoom ? true : undefined}
        inert={zoom !== null}
      >
        <div ref={columnRef} className="grid gap-6 page-in">
          {config.avatar ? (
            <Image src={config.avatar} alt="" width={48} height={48} className="w-12 h-12 rounded-full object-cover bg-neutral-100" priority />
          ) : (
            <span className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 text-white grid place-items-center text-[15px] font-medium" aria-hidden="true">
              {(config.name || '?').slice(0, 1)}
            </span>
          )}

          <div className="grid gap-6">
            <h1 className="font-normal">
              Hey, I&apos;m {config.name}.{bio ? <span> {bio}</span> : null}
            </h1>
            <p>
              You can browse my{' '}
              <Link href="/explore?view=writings" className={inlineLink}>writing</Link>,{' '}
              <Link href="/explore?view=illustration" className={inlineLink}>illustration</Link> and{' '}
              <Link href="/explore?view=interaction" className={inlineLink}>interaction</Link> work
              {socials.length > 0 && (
                <>
                  , or find me on{' '}
                  {socials.map((s, i) => (
                    <span key={s.label}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className={inlineLink}>{s.label}</a>
                      {i < socials.length - 2 ? ', ' : i === socials.length - 2 ? (email ? ', ' : ' and ') : ''}
                    </span>
                  ))}
                </>
              )}
              {email && (
                <>
                  {socials.length > 0 ? ' or send me an ' : ', or send me an '}
                  <a href={email} className={inlineLink}>Email</a>
                </>
              )}
              .
            </p>
          </div>

          {/* The project at the column edge; announced politely as the reel moves */}
          <div className="mt-6 md:mt-10">
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-medium text-[#8d8d8d]">Work</p>
              {projects.length > 1 && (
                <p className="relative text-[13px] font-[450] text-[#8d8d8d] tabular-nums" aria-hidden="true">
                  {/* The number rolls the way the reel moved */}
                  <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                    <motion.span
                      key={active}
                      custom={dir}
                      className="inline-block"
                      variants={roll}
                      initial="enter"
                      animate="center"
                      exit="exit"
                    >
                      {active + 1}
                    </motion.span>
                  </AnimatePresence>
                  {' '}/ {projects.length}
                </p>
              )}
            </div>
            {/* Old and new titles cross over instead of taking turns */}
            <div className="relative mt-4 min-h-[48px]" aria-live="polite" aria-atomic="true">
              <AnimatePresence mode="popLayout" initial={false} custom={dir}>
                <motion.div
                  key={current?.slug ?? 'empty'}
                  custom={dir}
                  variants={swap}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {current ? (
                    <>
                      <Link href={`/project/${current.slug}`} onClick={e => leaveFor(e, `/project/${current.slug}`)} className={`font-medium ${inlineLink}`}>{current.title}</Link>
                      {current.description && <p className="mt-1">{current.description}</p>}
                    </>
                  ) : (
                    <p className="text-[#8d8d8d]">New work is on its way.</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.header>

      {projects.length === 0 && (
        // Before any work exists, show the placeholder devices (decorative, not linked)
        <section aria-hidden="true" className="flex-1 md:min-h-0 flex items-end pt-8 pb-10 md:pb-14">
          <div
            className="w-full h-[min(360px,52vw)] md:h-[min(460px,36vw)] md:max-h-full flex items-end gap-14 md:gap-20 overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:snap-none scrollbar-none overscroll-x-contain select-none"
            style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
          >
            {PLACEHOLDER_PROJECTS.map((p, i) => (
              <div key={p.slug} className="shrink-0 h-full snap-start flex items-end">
                <DeviceMock project={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <motion.section
          aria-label="Work"
          className="flex-1 md:min-h-0 flex items-end pt-8 pb-10 md:pb-14"
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
            className="page-in page-in-late w-full h-[min(360px,52vw)] md:h-[min(460px,36vw)] md:max-h-full flex items-end gap-14 md:gap-20 overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:snap-none scrollbar-none overscroll-x-contain focus-visible:outline-none"
            // Same left edge as the text column, for layout and for snap points
            style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
          >
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                role="listitem"
                ref={el => { itemRefs.current[i] = el; }}
                href={`/project/${p.slug}`}
                aria-label={`${p.title}${p.description ? `, ${p.description}` : ''}`}
                onFocus={() => { if (!quietFocus.current) scrollToItem(i); }}
                onClick={e => {
                  // Modified clicks still open the case study in a new tab or window
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  openAt(i);
                }}
                className={`shrink-0 h-full snap-start flex items-end cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#2a2a2a] rounded-lg ${zoom?.index === i ? 'opacity-0' : ''}`}
              >
                <DeviceMock project={p} index={i} onAspect={recordAspect} />
              </Link>
            ))}
          </div>
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
  projects: Project[];
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
              <Link href={`/project/${project.slug}`} onClick={e => onCaseStudy(e, `/project/${project.slug}`)} aria-label={`Open the ${project.title} case study`} className="h-full flex items-center justify-center focus-visible:outline-none" tabIndex={-1} draggable={false}>
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
                <Link href={`/project/${project.slug}`} onClick={e => onCaseStudy(e, `/project/${project.slug}`)} className={inlineLink}>View case study</Link>
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

// Laptops for wide screenshots, phones for tall ones; without an image, alternate the two.
// In the project view (`zoomed`) the device fills its frame and follows the flight transform.
function DeviceMock({ project, index, zoomed = false, initialAspect, onAspect, rootRef, flight }: {
  project: Project;
  index: number;
  zoomed?: boolean;
  initialAspect?: number;
  onAspect?: (slug: string, aspect: number) => void;
  rootRef?: (el: HTMLDivElement | null) => void;
  flight?: { x: MotionValue<number>; y: MotionValue<number>; scale: MotionValue<number> };
}) {
  const src = projectImage(project);
  const [aspect, setAspect] = useState<number | null>(initialAspect ?? null);
  const device: Device = aspect ? (aspect < 0.85 ? 'phone' : 'laptop') : index % 2 === 0 ? 'laptop' : 'phone';
  const { slug } = project;
  const reportAspect = useCallback((a: number) => {
    setAspect(a);
    onAspect?.(slug, a);
  }, [onAspect, slug]);
  const screen = <Screen src={src} index={index} device={device} ready={initialAspect !== undefined} onAspect={reportAspect} />;

  if (isNewspaper(project)) {
    // Vector newspaper (components/Newspaper.tsx, 640×500), with the project as its front page
    return (
      <motion.div ref={rootRef} style={flight} className={`relative ${zoomed ? 'h-[min(100%,68vw)] md:h-[min(100%,43.8vw)]' : 'h-full'} aspect-[640/500]`}>
        <Newspaper project={project} image={src} />
      </motion.div>
    );
  }

  if (device === 'phone') {
    // iPhone 16 Pro Max frame (public/mockups/iphone-16-pro-max.png, 772×1600) with a see-through
    // screen; the shot sits underneath, inset and rounded to match the screen's opening.
    return (
      <motion.div ref={rootRef} style={flight} className={`relative ${zoomed ? 'h-full' : 'h-[96%]'} aspect-[772/1600]`}>
        <div className="absolute inset-x-[3.83%] inset-y-[1.52%] rounded-[15.4%/7.07%] overflow-hidden bg-white">{screen}</div>
        <Image src="/mockups/iphone-16-pro-max.png" alt="" aria-hidden="true" draggable={false} fill sizes="(max-width: 768px) 50vw, 340px" priority={index < 2} className="pointer-events-none select-none" />
      </motion.div>
    );
  }

  return (
    // MacBook Pro frame (public/mockups/macbook-pro.svg, viewBox 520×290) with a see-through 16:10
    // screen; the shot sits underneath, inset to the opening, and the notch draws over it.
    <motion.div ref={rootRef} style={flight} className={`relative ${zoomed ? 'h-[min(100%,48.8vw)] md:h-[min(100%,31.2vw)]' : 'h-full'} aspect-[520/290]`}>
      <div className="absolute inset-x-[10.385%] top-[2.069%] bottom-[9.138%] overflow-hidden bg-white [border-radius:1.21%_1.21%_0.36%_0.36%/1.94%_1.94%_0.58%_0.58%]">{screen}</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mockups/macbook-pro.svg" alt="" aria-hidden="true" draggable={false} className="absolute inset-0 w-full h-full pointer-events-none select-none" />
    </motion.div>
  );
}

// The device screen: the project image when it loads, otherwise placeholder screen artwork
function Screen({ src, index, device, ready = false, onAspect }: {
  src: string; index: number; device: Device; ready?: boolean; onAspect: (a: number) => void;
}) {
  // `ready`: the image already loaded in the reel, so the project view shows it straight away
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>(src ? (ready ? 'loaded' : 'loading') : 'failed');
  const wrapRef = useRef<HTMLDivElement>(null);
  // Images can finish before hydration, when onLoad/onError aren't attached yet
  useEffect(() => {
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
  }, [onAspect]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {state !== 'loaded' && (
        // Placeholder screen artwork until the project has an image of its own
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={reelPlaceholder(device, index)}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      )}
      {state !== 'failed' && src && (
        <Image
          src={src}
          alt=""
          data-project-image
          fill
          sizes={device === 'laptop' ? '(max-width: 768px) 80vw, 720px' : '(max-width: 768px) 40vw, 260px'}
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
