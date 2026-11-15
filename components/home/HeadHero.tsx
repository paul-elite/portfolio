'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './shell.module.css';

// three.js is client-only — load the canvas without SSR.
const HeadModel = dynamic(() => import('./HeadModel'), { ssr: false });

/* The centerpiece: a full 3D bust you can orbit. A static render sits
   underneath for instant paint, a no-JS/no-WebGL fallback, and a resting
   image for reduced-motion. The live canvas overlays it once loaded. */
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
      <img src="/head/head-still.png" alt="" className={styles.headStill} aria-hidden="true" />
      <div className={styles.headCanvas}>
        <HeadModel animate={animate} />
      </div>
    </div>
  );
}
