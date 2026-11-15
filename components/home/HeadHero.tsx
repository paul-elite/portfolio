'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './shell.module.css';

// three.js is client-only — load the canvas without SSR.
const DepthHead = dynamic(() => import('./DepthHead'), { ssr: false });

/* The centerpiece: a 3D rotating head. A static portrait sits underneath so
   there is an instant paint, a no-JS/no-WebGL fallback, and a resting image
   for reduced-motion. The live canvas overlays it exactly once loaded. */
export default function HeadHero({ label = 'Portrait' }: { label?: string }) {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setAnimate(!mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return (
    <div className={styles.head} aria-label={label} role="img">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/head/portrait.png" alt="" className={styles.headStill} aria-hidden="true" />
      <div className={styles.headCanvas}>
        <DepthHead animate={animate} />
      </div>
    </div>
  );
}
