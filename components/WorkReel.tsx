'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Project, SiteConfig } from '@/lib/content-model';

interface WorkReelProps {
  config: SiteConfig;
  projects: Project[];
}

// Text column width and its left edge; the reel starts on the same edge
const COLUMN = 625;
const GUTTER = `max(1.5rem, calc((100vw - ${COLUMN}px) / 2))`;
// Screen tints for projects without an image yet, so a device never shows a blank screen
const TINTS = ['#e8eefc', '#fdeee4', '#e6f6ef', '#f3e9fb', '#fdf3d8', '#e4f3f8'];

const projectImage = (p: Project) => p.preview || p.previewImages?.[0] || p.avatar || '';

// Ayomide-style inline link: same size and colour as the text, dotted underline
const inlineLink = 'underline decoration-dotted decoration-[#b2b2b2] decoration-1 underline-offset-4 hover:decoration-[#2a2a2a] transition-colors';

type Device = 'laptop' | 'phone';

/**
 * Home: a short introduction set in small, even type (after dahnizzy.com), with the work
 * shown on device mockups in one sideways reel (after mikematas.com). The "Work" line names
 * whichever project sits at the column edge, and every device opens its case study.
 */
export default function WorkReel({ config, projects }: WorkReelProps) {
  const reelRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const current = projects[active];

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
    setActive(best);
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

  return (
    <div className="min-h-dvh md:h-dvh flex flex-col bg-white text-[14px] leading-6 text-[#2a2a2a] font-sans">
      <header className="w-full max-w-[625px] mx-auto px-6 md:px-0 pt-12 md:pt-[72px]">
        <div ref={columnRef} className="grid gap-6">
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
                <p className="text-[13px] font-[450] text-[#8d8d8d] tabular-nums" aria-hidden="true">
                  {active + 1} / {projects.length}
                </p>
              )}
            </div>
            <div className="mt-4 min-h-[48px]" aria-live="polite" aria-atomic="true">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={current?.slug ?? 'empty'}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {current ? (
                    <>
                      <Link href={`/project/${current.slug}`} className={`font-medium ${inlineLink}`}>{current.title}</Link>
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
      </header>

      {projects.length > 0 && (
        <section aria-label="Work" className="flex-1 md:min-h-0 flex items-end pt-8 pb-10 md:pb-14">
          <div
            ref={reelRef}
            role="list"
            tabIndex={0}
            aria-label="Projects. Use the left and right arrow keys to move through them."
            onKeyDown={onReelKey}
            className="w-full h-[min(360px,52vw)] md:h-[min(460px,36vw)] md:max-h-full flex items-end gap-14 md:gap-20 overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:snap-none scrollbar-none overscroll-x-contain focus-visible:outline-none"
            // Same left edge as the text column, for layout and for snap points
            style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
          >
            {projects.map((p, i) => (
              <Link
                key={p.slug}
                role="listitem"
                ref={el => { itemRefs.current[i] = el; }}
                href={`/project/${p.slug}`}
                aria-label={`${p.title}${p.description ? `, ${p.description}` : ''}. Open case study`}
                onFocus={() => scrollToItem(i)}
                className="group shrink-0 h-full snap-start flex items-end focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#2a2a2a] rounded-lg"
              >
                <DeviceMock project={p} index={i} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- Device mockups ---------- */

// Laptops for wide screenshots, phones for tall ones; without an image, alternate the two
function DeviceMock({ project, index }: { project: Project; index: number }) {
  const src = projectImage(project);
  const [aspect, setAspect] = useState<number | null>(null);
  const device: Device = aspect ? (aspect < 0.85 ? 'phone' : 'laptop') : index % 2 === 0 ? 'laptop' : 'phone';
  const lift = 'transition-transform duration-500 ease-out group-hover:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0';
  const screen = <Screen src={src} title={project.title} index={index} device={device} onAspect={setAspect} />;

  if (device === 'phone') {
    return (
      <div className={`relative h-[82%] aspect-[9/19.5] rounded-[clamp(22px,3.6vh,40px)] bg-[#111113] p-[clamp(5px,0.75vh,8px)] shadow-[0_24px_40px_-24px_rgba(0,0,0,0.45)] ring-1 ring-black/5 ${lift}`}>
        <div className="relative w-full h-full rounded-[clamp(17px,2.9vh,32px)] overflow-hidden bg-white">
          {screen}
          <span className="absolute top-[1.6%] left-1/2 -translate-x-1/2 w-[30%] h-[3.2%] rounded-full bg-black" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-full aspect-[1.62] ${lift}`}>
      {/* Lid */}
      <div className="absolute left-[7%] right-[7%] top-0 bottom-[4.2%] rounded-t-[clamp(10px,1.8vh,18px)] bg-[#111113] p-[1.3%] pb-[2.4%] ring-1 ring-black/5">
        <span className="absolute top-[0.7%] left-1/2 -translate-x-1/2 w-[0.7%] aspect-square rounded-full bg-[#2a2a2d]" aria-hidden="true" />
        <div className="relative w-full h-full overflow-hidden rounded-[3px] bg-white">{screen}</div>
      </div>
      {/* Base */}
      <div className="absolute inset-x-0 bottom-0 h-[4.2%] rounded-b-[50%_100%] bg-gradient-to-b from-[#e2e3e6] to-[#a9abb0] shadow-[0_18px_28px_-18px_rgba(0,0,0,0.5)]" aria-hidden="true">
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-[14%] h-[38%] rounded-b-md bg-[#c4c6ca]" />
      </div>
    </div>
  );
}

// The device screen: the project image when it loads, otherwise a quiet placeholder UI
function Screen({ src, title, index, device, onAspect }: {
  src: string; title: string; index: number; device: Device; onAspect: (a: number) => void;
}) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>(src ? 'loading' : 'failed');
  const wrapRef = useRef<HTMLDivElement>(null);
  // Images can finish before hydration, when onLoad/onError aren't attached yet
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const img = wrapRef.current?.querySelector('img');
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
        <div className="absolute inset-0 flex flex-col" style={{ background: TINTS[index % TINTS.length] }}>
          {device === 'laptop' ? (
            <div className="h-[7%] min-h-[14px] flex items-center gap-[1%] px-[2.4%] bg-white/55" aria-hidden="true">
              <span className="w-[1.1%] aspect-square rounded-full bg-[#ff5f57]" />
              <span className="w-[1.1%] aspect-square rounded-full bg-[#febc2e]" />
              <span className="w-[1.1%] aspect-square rounded-full bg-[#28c840]" />
            </div>
          ) : (
            <div className="h-[9%]" aria-hidden="true" />
          )}
          <div className="flex-1 min-w-0 grid place-items-center p-[8%] text-center">
            <span className={`font-medium text-[#2a2a2a]/70 tracking-[-0.01em] ${device === 'laptop' ? 'text-[clamp(13px,1.9vh,18px)]' : 'text-[clamp(9px,1.5vh,15px)] leading-tight break-words'}`}>{title}</span>
          </div>
        </div>
      )}
      {state !== 'failed' && src && (
        <Image
          src={src}
          alt=""
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
