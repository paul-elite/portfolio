'use client';

import { useEffect, useState } from 'react';
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
    <nav className={r.tocNav} aria-label="Contents">
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
