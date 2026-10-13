'use client';

import { MouseEvent, ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1] as [number, number, number, number];
// Rise in on arrival; leave quicker, so the next page isn't kept waiting
const enter = { duration: 0.5, ease };
const exit = { duration: 0.2, ease };

export default function DetailPageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [exiting, setExiting] = useState(false);
  const reduceMotion = useReducedMotion();
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
    }, exit.duration * 1000);
  };

  return (
    <motion.main
      className="min-h-screen bg-white"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={exiting ? { opacity: 0, y: reduceMotion ? 0 : -6 } : { opacity: 1, y: 0 }}
      transition={exiting ? exit : enter}
      onClick={handleClick}
    >
      {children}
    </motion.main>
  );
}
