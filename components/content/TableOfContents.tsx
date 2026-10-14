'use client';

import { useEffect, useRef, useState } from 'react';

// Contents for long-form case studies: sticky in the left margin, with a reading timeline beside it.
// Each section has a dot; the line fills continuously from one dot to the next as the section is read.
export default function TableOfContents({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(-1);
  const [track, setTrack] = useState({ top: 0, bottom: 0, fill: 0 });
  const dots = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.33;
      const tops = items.map(({ id }) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity);
      // The current section is the last heading that has scrolled past the top third of the screen
      let k = -1;
      tops.forEach((top, i) => { if (top < line) k = i; });
      setActive(k);

      // Dot centres, measured within the list (each dot sits inside its own positioned item)
      const dotY = dots.current.map(d => (d ? (d.parentElement?.offsetTop ?? 0) + d.offsetTop + d.offsetHeight / 2 : 0));
      const first = dotY[0] ?? 0;
      const last = dotY[dotY.length - 1] ?? 0;
      let fill = first;
      if (k >= 0) {
        // How far through section k the reader is: up to the next heading, or the end of the page for the last one
        const start = tops[k];
        const end = k + 1 < tops.length ? tops[k + 1] : document.documentElement.scrollHeight - window.scrollY - window.innerHeight + line;
        const t = Math.min(1, Math.max(0, (line - start) / Math.max(1, end - start)));
        fill = k + 1 < dotY.length ? dotY[k] + t * (dotY[k + 1] - dotY[k]) : last;
      }
      setTrack({ top: first, bottom: last, fill });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [items]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <nav aria-label="Contents" className="sticky top-16 max-h-[calc(100vh-6rem)] overflow-y-auto pr-6">
      <p className="mb-3 pl-5 text-xs text-gray-400">Contents</p>
      <ol className="relative space-y-2">
        {/* Timeline: a quiet track between the first and last dots, filled up to the reading position */}
        <span aria-hidden className="absolute left-[3px] w-px bg-gray-200" style={{ top: track.top, height: Math.max(0, track.bottom - track.top) }} />
        <span aria-hidden className="absolute left-[3px] w-px bg-gray-900" style={{ top: track.top, height: Math.max(0, track.fill - track.top) }} />
        {items.map(({ id, label }, i) => (
          <li key={id} className="relative pl-5">
            <span
              ref={el => { dots.current[i] = el; }}
              aria-hidden
              className={`absolute left-0 top-[0.4em] h-[7px] w-[7px] rounded-full border transition-colors duration-200 ${i <= active ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'}`}
            />
            <a
              href={`#${id}`}
              onClick={(e) => go(e, id)}
              aria-current={active === i ? 'location' : undefined}
              className={`block text-[13px] leading-snug transition-colors ${active === i ? 'text-gray-900' : i < active ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
