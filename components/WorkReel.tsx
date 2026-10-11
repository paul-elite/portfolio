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

// Soft tints for projects that have no image yet, so the reel never shows a blank gap
const GUTTER = 'max(1.5rem, calc((100vw - 1100px) / 2 + 2.5rem))';
const TINTS = ['#e8eefc', '#fdeee4', '#e6f6ef', '#f3e9fb', '#fdf3d8', '#e4f3f8'];

const projectImage = (p: Project) => p.preview || p.previewImages?.[0] || p.avatar || '';

/**
 * Home layout after mikematas.com: name and a short bio up top, the work laid out in one
 * sideways reel below. The line under the name always names the project nearest the
 * reading edge, and every piece opens its case study.
 */
export default function WorkReel({ config, projects }: WorkReelProps) {
  const reelRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const current = projects[active];

  // The project whose centre is nearest the left text column is the one "in view"
  const measure = useCallback(() => {
    const reel = reelRef.current;
    if (!reel || projects.length === 0) return;
    const anchorX = (anchorRef.current?.getBoundingClientRect().left ?? 0) + 120;
    let best = 0;
    let bestDistance = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      // At the very end of the reel, the last piece wins even if it can't reach the anchor
      const atEnd = reel.scrollLeft + reel.clientWidth >= reel.scrollWidth - 4;
      const distance = atEnd && i === projects.length - 1 ? -1 : Math.abs(r.left + Math.min(r.width, 240) / 2 - anchorX);
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
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
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
    const anchorLeft = anchorRef.current?.getBoundingClientRect().left ?? 0;
    reel.scrollTo({
      left: reel.scrollLeft + el.getBoundingClientRect().left - anchorLeft,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const onReelKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const next = Math.min(projects.length - 1, Math.max(0, active + (e.key === 'ArrowRight' ? 1 : -1)));
      scrollToItem(next);
      itemRefs.current[next]?.focus({ preventScroll: true });
    }
  };

  const links = [
    { label: 'Writing', href: '/explore?view=writings' },
    { label: 'Illustration', href: '/explore?view=illustration' },
    { label: 'Interaction', href: '/explore?view=interaction' },
    ...(config.social.twitter ? [{ label: 'X', href: config.social.twitter, external: true }] : []),
    ...(config.social.instagram ? [{ label: 'Instagram', href: config.social.instagram, external: true }] : []),
    ...(config.social.email ? [{ label: 'Email', href: config.social.email.startsWith('mailto:') ? config.social.email : `mailto:${config.social.email}`, external: true }] : []),
  ];
  const bio = config.bio || config.title;

  return (
    <div className="min-h-dvh md:h-dvh flex flex-col bg-white text-[#111]">
      <header className="w-full max-w-[1100px] mx-auto px-6 sm:px-10 pt-16 sm:pt-24 md:pt-28 grid gap-8 md:grid-cols-[1fr_auto]">
        <div ref={anchorRef} className="min-w-0">
          <div className="flex items-center gap-4">
            {config.avatar ? (
              <Image src={config.avatar} alt="" width={56} height={56} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover bg-neutral-100" priority />
            ) : (
              <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 text-white grid place-items-center text-lg font-medium" aria-hidden="true">
                {(config.name || '?').slice(0, 1)}
              </span>
            )}
            <h1 className="text-[34px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] font-normal">{config.name}</h1>
          </div>

          {/* Names the piece in view; announced politely so screen readers follow along */}
          <div className="mt-1 h-[44px] sm:h-[48px] overflow-hidden" aria-live="polite" aria-atomic="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={current?.slug ?? 'empty'}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="text-[34px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] text-neutral-400 truncate"
              >
                {current ? current.title : 'Work in progress'}
              </motion.p>
            </AnimatePresence>
          </div>

          {bio && <p className="mt-5 max-w-[34rem] text-[15px] leading-relaxed text-neutral-500">{bio}</p>}
        </div>

        <nav aria-label="Elsewhere" className="flex md:flex-col flex-wrap gap-x-5 gap-y-1 text-[17px] md:text-[18px] md:pt-1">
          {links.map(l =>
            l.external ? (
              <a key={l.label} href={l.href} target={l.href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" className="text-neutral-400 hover:text-[#111] transition-colors">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} href={l.href} className="text-neutral-400 hover:text-[#111] transition-colors">{l.label}</Link>
            ),
          )}
        </nav>
      </header>

      <section aria-label="Work" className="flex-1 min-h-[320px] flex items-end pb-10 sm:pb-16 pt-10">
        {projects.length === 0 ? (
          <div className="w-full max-w-[1100px] mx-auto px-6 sm:px-10 text-neutral-400 text-[15px]">
            New work is on its way.
          </div>
        ) : (
          <div
            ref={reelRef}
            role="list"
            tabIndex={0}
            aria-label="Projects. Use the left and right arrow keys to move through them."
            onKeyDown={onReelKey}
            className="w-full h-full max-h-[560px] flex items-end gap-16 sm:gap-24 overflow-x-auto overflow-y-hidden snap-x snap-mandatory md:snap-none scrollbar-none overscroll-x-contain focus-visible:outline-none"
            // Same side gutter as the text above, for both layout and snap points
            style={{ paddingInline: GUTTER, scrollPaddingInline: GUTTER }}
          >
            {projects.map((p, i) => {
              const src = projectImage(p);
              return (
                <Link
                  key={p.slug}
                  role="listitem"
                  ref={el => { itemRefs.current[i] = el; }}
                  href={`/project/${p.slug}`}
                  aria-label={`${p.title}${p.description ? `, ${p.description}` : ''}. Open case study`}
                  onFocus={() => scrollToItem(i)}
                  className="group relative shrink-0 h-[42vh] sm:h-[48vh] md:h-full snap-start flex items-end focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#111] rounded-sm"
                >
                  <ReelVisual src={src} title={p.title} index={i} />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// A project's image. Until it loads (or if it can't), a tinted title tile holds its place,
// so the reel never shows an empty gap.
function ReelVisual({ src, title, index }: { src: string; title: string; index: number }) {
  const [state, setState] = useState<'loading' | 'loaded' | 'failed'>(src ? 'loading' : 'failed');
  const wrapRef = useRef<HTMLSpanElement>(null);
  // Preloaded images can finish before hydration, when onLoad/onError aren't attached yet
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const img = wrapRef.current?.querySelector('img');
      if (img?.complete) setState(img.naturalWidth > 0 ? 'loaded' : 'failed');
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const lift = 'transition-transform duration-500 ease-out group-hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0';
  const tile = (
    <span
      className={`h-full aspect-[4/3] max-w-[85vw] rounded-2xl grid place-items-center p-8 text-center text-[22px] tracking-[-0.01em] text-neutral-500 ${lift}`}
      style={{ background: TINTS[index % TINTS.length] }}
    >
      {title}
    </span>
  );
  if (state === 'failed') return tile;
  return (
    <span ref={wrapRef} className="relative h-full flex items-end">
      {state === 'loading' && tile}
      <Image
        src={src}
        alt=""
        width={1600}
        height={1000}
        sizes="(max-width: 768px) 85vw, 60vw"
        priority={index < 2}
        onLoad={() => setState('loaded')}
        onError={() => setState('failed')}
        className={`h-full w-auto max-w-[85vw] md:max-w-[70vw] object-contain object-bottom ${lift} ${state === 'loading' ? 'absolute inset-0 opacity-0' : ''}`}
      />
    </span>
  );
}
