'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion';
import type { AnimatedScreen as Screen, LayerMotion } from '@/lib/screen-animations';

// One play-through of the interface coming together; then it fades back and plays again
const CYCLE_MS = 7200;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// Where each kind of layer starts, where it ends, and how it gets there
function motionFor(kind: LayerMotion, delay: number): { initial: TargetAndTransition; animate: TargetAndTransition; transition: Transition } {
  const spring = { type: 'spring' as const, visualDuration: 0.5, bounce: 0.35, delay };
  switch (kind) {
    case 'pop':
      return { initial: { opacity: 0, scale: 0.4 }, animate: { opacity: 1, scale: 1 }, transition: { ...spring, opacity: { duration: 0.2, delay } } };
    case 'drop':
      return { initial: { opacity: 0, y: '-60%' }, animate: { opacity: 1, y: '0%' }, transition: { ...spring, bounce: 0.45, opacity: { duration: 0.2, delay } } };
    case 'draw':
      // The route runs up from the truck, so it is revealed from the bottom
      return { initial: { clipPath: 'inset(100% 0 0 0)' }, animate: { clipPath: 'inset(0% 0 0 0)' }, transition: { duration: 0.75, ease: EASE_OUT, delay } };
    case 'rise':
      return { initial: { opacity: 0, y: '18%' }, animate: { opacity: 1, y: '0%' }, transition: { type: 'spring', visualDuration: 0.6, bounce: 0.15, delay, opacity: { duration: 0.3, delay } } };
    case 'lower':
      return { initial: { opacity: 0, y: '-60%' }, animate: { opacity: 1, y: '0%' }, transition: { type: 'spring', visualDuration: 0.5, bounce: 0.2, delay, opacity: { duration: 0.25, delay } } };
    case 'pulse':
      return { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1 }, transition: { ...spring, opacity: { duration: 0.2, delay } } };
  }
}

/** A project's screen rebuilt from its layers, so the interface itself animates. */
export default function AnimatedScreen({ screen, sizes }: { screen: Screen; sizes: string }) {
  const reduceMotion = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => { if (!document.hidden) setCycle(c => c + 1); }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image src={screen.base} alt="" fill sizes={sizes} className="object-cover object-top" draggable={false} />
      <AnimatePresence initial={!reduceMotion}>
        <motion.div
          key={cycle}
          className="absolute inset-0"
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
        >
          {screen.layers.map((layer, i) => {
            const m = reduceMotion ? { initial: {}, animate: {}, transition: {} } : motionFor(layer.motion, layer.delay);
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ left: pct(layer.x, screen.width), top: pct(layer.y, screen.height), width: pct(layer.w, screen.width), height: pct(layer.h, screen.height) }}
                initial={m.initial}
                animate={m.animate}
                transition={m.transition}
              >
                {layer.motion === 'pulse' && !reduceMotion && (
                  // A soft ring that keeps breathing out from the truck
                  <motion.span
                    className="absolute inset-[18%] rounded-full bg-[#2b8cff]"
                    initial={{ opacity: 0.35, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: layer.delay + 0.4 }}
                  />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={layer.src} alt="" draggable={false} className="relative w-full h-full select-none" />
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
