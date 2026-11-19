'use client';

import { useEffect, useRef, useState } from 'react';
import r from './reader.module.css';

type Toc = { id: string; label: string }[];

// The article's contents, kept in step with the scroll: a ruler runs beside the labels (fine ticks, a
// longer one level with each label) and a marker slides along it with the reading position, gliding
// from one label to the next as each section scrolls past. The section being read is darkest, the
// ones already read are mid grey and the rest stay light.
export default function TocRail({ toc }: { toc: Toc }) {
  const nav = useRef<HTMLElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = nav.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const links = [...el.querySelectorAll<HTMLElement>('[data-toc]')];
      const heads = toc.map(({ id }) => document.getElementById(id));
      if (!links.length) return;
      // The reading line: a third of the way down the window
      const line = window.innerHeight / 3;
      const tops = heads.map((h) => (h ? h.getBoundingClientRect().top - line : Infinity));
      const navTop = el.getBoundingClientRect().top;
      const centers = links.map((l) => {
        const b = l.getBoundingClientRect();
        return b.top - navTop + b.height / 2;
      });
      // The article's end, for the last section's share of the ruler
      const article = el.closest('[data-reader]')?.querySelector('article');
      const end = article ? article.getBoundingClientRect().bottom - window.innerHeight : Infinity;
      let k = -1;
      tops.forEach((t, i) => { if (t <= 0) k = i; });
      let y: number;
      if (k < 0) y = centers[0];
      else {
        const from = tops[k];
        const to = k + 1 < tops.length ? tops[k + 1] : end;
        const span = to - from;
        const f = span > 0 && Number.isFinite(span) ? Math.min(1, Math.max(0, -from / span)) : 0;
        // The last section runs the marker a short way past its label as the article ends
        const next = k + 1 < centers.length ? centers[k + 1] : centers[k] + 12;
        y = centers[k] + (next - centers[k]) * f;
      }
      // Scrolled to the end: the last sections are short and their headings can't reach the reading
      // line, so the end of the page always lands on the last one
      const room = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      if (room < 2) { k = links.length - 1; y = centers[k]; }
      if (marker.current) marker.current.style.transform = `translateY(${y}px)`;
      setActive(k);
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
    <nav ref={nav} className={r.tocNav} aria-label="Contents">
      <span className={r.ruler} aria-hidden />
      <span ref={marker} className={r.marker} aria-hidden />
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
            {h.label}
          </a>
        );
      })}
    </nav>
  );
}
