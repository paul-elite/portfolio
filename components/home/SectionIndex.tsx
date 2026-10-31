'use client';

import { useEffect, useState } from 'react';
import styles from '@/app/home.module.css';

// Fixed section index for the snapping home. Highlights the section on screen,
// and honours /?section= links by jumping straight to that section.
export default function SectionIndex({ sections, initial }: { sections: { id: string; label: string }[]; initial?: string }) {
  const [active, setActive] = useState('intro');

  useEffect(() => {
    if (initial) document.getElementById(initial)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [initial]);

  useEffect(() => {
    const els = ['intro', ...sections.map((s) => s.id)].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { threshold: [0.5, 0.75] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Sections" className={styles.sectionIndex} data-hidden={active === 'intro' ? '' : undefined}>
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} aria-current={active === s.id ? 'true' : undefined}>
          {s.label}
        </a>
      ))}
    </nav>
  );
}
