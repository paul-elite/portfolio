'use client';

import { useEffect, useRef, useState } from 'react';
import r from './reader.module.css';

// The Back button's holder. On a phone it slides away while you scroll down and comes back the moment
// you scroll up (or reach the top); the CSS only hides it on narrow screens, so desktop keeps it pinned.
export default function BackBar({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  useEffect(() => {
    last.current = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const d = y - last.current;
      // a few pixels of hysteresis so a resting thumb doesn't flicker it
      if (y < 40) setHidden(false);
      else if (d > 6) setHidden(true);
      else if (d < -6) setHidden(false);
      if (Math.abs(d) > 6 || y < 40) last.current = y;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, []);
  return <div className={r.topbar} data-hidden={hidden || undefined}>{children}</div>;
}
