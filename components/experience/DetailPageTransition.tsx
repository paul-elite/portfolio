'use client';

import { MouseEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export default function DetailPageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest<HTMLAnchorElement>('a[data-detail-transition]');
    if (!link) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.target && link.target !== '_self') return;

    const href = link.getAttribute('href');
    if (!href) return;

    event.preventDefault();
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);

    setExiting(true);
    exitTimerRef.current = setTimeout(() => {
      router.push(href);
    }, transition.duration * 1000);
  };

  return (
    <motion.main
      className="min-h-screen bg-white"
      initial={{ opacity: 0, x: 18 }}
      animate={exiting ? { opacity: 0, x: -18 } : { opacity: 1, x: 0 }}
      transition={transition}
      onClick={handleClick}
    >
      {children}
    </motion.main>
  );
}
