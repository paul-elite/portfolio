'use client';

import { useEffect, useState } from 'react';

// Contents for long-form case studies: sticky in the left margin, with a reading timeline beside it.
// Each section has its own segment of the line; sections still to come are light, read ones mid grey,
// and the current one black, for both the line and the label.
export default function TableOfContents({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const update = () => {
      const line = window.innerHeight * 0.33;
      const tops = items.map(({ id }) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity);
      // The current section is the last heading that has scrolled past the top third of the screen
      let k = -1;
      tops.forEach((top, i) => { if (top < line) k = i; });
      setActive(k);
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
      <p className="mb-3 pl-4 text-xs text-gray-400">Contents</p>
      <ol>
        {items.map(({ id, label }, i) => {
          const state = i === active ? 'current' : i < active ? 'read' : 'ahead';
          return (
            <li key={id} className="relative py-1 pl-4">
              <span
                aria-hidden
                className={`absolute left-0 inset-y-0 w-px transition-colors duration-200 ${state === 'current' ? 'bg-gray-900' : state === 'read' ? 'bg-gray-400' : 'bg-gray-200'}`}
              />
              <a
                href={`#${id}`}
                onClick={(e) => go(e, id)}
                aria-current={state === 'current' ? 'location' : undefined}
                className={`block text-[13px] leading-snug transition-colors duration-200 ${state === 'current' ? 'text-gray-900' : state === 'read' ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 hover:text-gray-500'}`}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
