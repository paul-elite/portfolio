'use client';

import { useEffect, useState } from 'react';

// Contents for long-form case studies: sticky in the left margin, highlighting the section being read.
export default function TableOfContents({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      // The current section is the last heading that has scrolled past the top third of the screen
      let current: string | null = null;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.33) current = id;
      }
      setActive(current);
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
    <nav aria-label="Contents" className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto pr-6">
      <p className="mb-3 text-xs text-gray-400">Contents</p>
      <ol className="space-y-2">
        {items.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => go(e, id)}
              aria-current={active === id ? 'location' : undefined}
              className={`block text-[13px] leading-snug transition-colors ${active === id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
