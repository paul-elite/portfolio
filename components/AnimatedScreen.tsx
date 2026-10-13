'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, type TargetAndTransition, type Transition } from 'framer-motion';
import type { AnimatedScreen as Screen, ScreenLayer } from '@/lib/screen-animations';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

// The interface starts once the phone is about halfway into its slide, so the two overlap
const START_AFTER_MS = 450;

// A layer's starting pose, its resting pose, and how it moves between them. Offsets are in screen
// pixels, turned into a share of the layer's own size so they scale with the device.
function motionFor(layer: ScreenLayer): { initial: TargetAndTransition; animate: TargetAndTransition; transition: Transition } {
  const { from } = layer;
  const initial: TargetAndTransition = {};
  const animate: TargetAndTransition = {};
  if (from.opacity !== undefined) { initial.opacity = from.opacity; animate.opacity = 1; }
  if (from.x !== undefined) { initial.x = `${(from.x / layer.w) * 100}%`; animate.x = '0%'; }
  if (from.y !== undefined) { initial.y = `${(from.y / layer.h) * 100}%`; animate.y = '0%'; }
  if (from.scale !== undefined) { initial.scale = from.scale; animate.scale = 1; }
  if (from.reveal === 'up') { initial.clipPath = 'inset(100% 0 0 0)'; animate.clipPath = 'inset(0% 0 0 0)'; }
  // A settled spring with no overshoot by default; a smooth ease-out where a duration is given
  const move: Transition = layer.duration
    ? { duration: layer.duration, ease: EASE_OUT, delay: layer.delay }
    : { type: 'spring', visualDuration: 0.65, bounce: 0, delay: layer.delay };
  return { initial, animate, transition: { ...move, opacity: { duration: 0.45, ease: EASE_OUT, delay: layer.delay } } };
}

/** A screen rebuilt from its layers; it plays once, in order, after its phone has come into view. */
export default function AnimatedScreen({ screen, sizes, active = true }: { screen: Screen; sizes: string; active?: boolean }) {
  const reduceMotion = useReducedMotion();
  const [played, setPlayed] = useState(false);
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  useEffect(() => {
    if (!active || played) return;
    const timer = setTimeout(() => setPlayed(true), START_AFTER_MS);
    return () => clearTimeout(timer);
  }, [active, played]);

  const show = played || !!reduceMotion;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image src={screen.base} alt="" fill sizes={sizes} className="object-cover object-top" draggable={false} />
      {screen.layers.map((layer, i) => {
        const m = motionFor(layer);
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: pct(layer.x, screen.width), top: pct(layer.y, screen.height), width: pct(layer.w, screen.width), height: pct(layer.h, screen.height) }}
            initial={reduceMotion ? false : m.initial}
            animate={show ? m.animate : m.initial}
            transition={reduceMotion ? { duration: 0 } : m.transition}
          >
            {layer.pulse && show && !reduceMotion && (
              // A soft ring that keeps breathing out once the layer has arrived
              <motion.span
                className="absolute inset-[18%] rounded-full bg-[#2b8cff]"
                initial={{ opacity: 0.3, scale: 0.8 }}
                animate={{ opacity: 0, scale: 2.2 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: layer.delay + 0.5 }}
              />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={layer.src} alt="" draggable={false} className="relative w-full h-full select-none" />
          </motion.div>
        );
      })}
    </div>
  );
}
