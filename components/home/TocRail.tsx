'use client';

import { useEffect, useRef, useState } from 'react';
import r from './reader.module.css';

type Toc = { id: string; label: string }[];

// The article's contents, kept in step with the scroll: a ruler runs beside the labels (fine ticks, a
// longer one level with each label). Each tick keeps its own state: the long one lights as you reach the
// topic, the short one halfway through it. The section being read is darkest, the ones already read are mid
// grey and the ones still to come are quietest.
const tickState = (n: number, at: number) => (n === at ? 'current' : n < at ? 'read' : 'ahead');

export default function TocRail({ toc }: { toc: Toc }) {
  const [active, setActive] = useState(-1);
  // The ruler's own position, in ticks: the long tick of topic k is 2k, the short one after it 2k + 1
  const [tick, setTick] = useState(-1);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      // The section being read is the last heading past a line a third of the way down the window
      const line = window.innerHeight / 3;
      const tops = toc.map(({ id }) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity);
      let k = -1;
      tops.forEach((t, i) => { if (t <= line) k = i; });
      // Halfway through a topic its short tick lights: how far the reading line is between this heading and the next
      let half = false;
      if (k >= 0) {
        const next = k + 1 < tops.length ? tops[k + 1] : (document.querySelector('[data-reader] article')?.getBoundingClientRect().bottom ?? Infinity);
        half = line - tops[k] >= (next - tops[k]) / 2;
      }
      // Scrolled to the end: the last sections are short and their headings can't reach the line
      if (document.documentElement.scrollHeight - window.innerHeight - window.scrollY < 2) { k = toc.length - 1; half = false; }
      setActive(k);
      setTick(k < 0 ? -1 : 2 * k + (half ? 1 : 0));
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, [toc]);

  // The white card behind a label: one card for the whole list that slides from label to label as the
  // pointer moves down it (or keyboard focus does), rather than a card appearing on each label in turn.
  // It arrives where it's needed without sliding (from wherever it last was), and fades when the pointer leaves.
  const navRef = useRef<HTMLElement>(null);
  const [hl, setHl] = useState<{ x: number; y: number; w: number; h: number; on: boolean; jump: boolean }>({ x: 0, y: 0, w: 0, h: 0, on: false, jump: true });
  const point = (el: Element | null) => {
    const a = el && (el as HTMLElement).closest ? ((el as HTMLElement).closest('a[data-toc]') as HTMLElement | null) : null;
    if (!a) return;
    setHl((was) => ({ x: a.offsetLeft - 8, y: a.offsetTop - 3, w: a.offsetWidth + 16, h: a.offsetHeight + 6, on: true, jump: !was.on }));
  };
  const leave = () => setHl((was) => ({ ...was, on: false }));

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const h = document.getElementById(id);
    if (!h) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Land the heading just above the reading line, so its section is the one marked
    window.scrollTo({ top: h.getBoundingClientRect().top + window.scrollY - window.innerHeight / 3 + 8, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav
      ref={navRef}
      className={r.tocNav}
      aria-label="Contents"
      onPointerOver={(e) => { if (e.pointerType === 'mouse') point(e.target as Element); }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') leave(); }}
      onFocus={(e) => { if ((e.target as HTMLElement).matches(':focus-visible')) point(e.target); }}
      onBlur={(e) => { if (!navRef.current?.contains(e.relatedTarget as Node)) leave(); }}
    >
      <span
        className={r.tocHl}
        aria-hidden
        data-on={hl.on || undefined}
        data-jump={hl.jump || undefined}
        style={{ transform: `translate(${hl.x}px, ${hl.y}px)`, width: hl.w, height: hl.h }}
      />
      {toc.map((h, i) => {
        const state = i === active ? 'current' : i < active ? 'read' : 'ahead';
        return (
          <a
            key={h.id}
            href={`#${h.id}`}
            data-toc
            data-state={state}
            aria-current={state === 'current' ? 'location' : undefined}
            onClick={(e) => go(e, h.id)}
            className={r.tocLink}
          >
            <span className={r.tickLong} data-state={tickState(2 * i, tick)} aria-hidden />
            {i < toc.length - 1 && <span className={r.seg} data-state={tickState(2 * i + 1, tick)} aria-hidden />}
            {h.label}
          </a>
        );
      })}
    </nav>
  );
}
