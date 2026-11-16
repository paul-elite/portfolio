'use client';

import { useEffect, useState } from 'react';
import g from './glitch.module.css';

// The home name decodes itself: every letter shuffles through random
// characters, then each one locks in at its own random moment, so the
// characters and the settle order differ on every load.
// Pool = glyphs of roughly one width at the name's own weight (mid-width
// lowercase, tabular digits, a few same-width symbols), so the word keeps its
// shape and colour while it scrambles. No i/l/j/t/f/r (narrow) or m/w (wide).
const POOL = 'abcdeghknopqsuvxyz0123456789#$?';
const TICK_MS = 45; // how often unlocked letters change
const MIN_SETTLE_MS = 168; // 250ms x 0.67
const MAX_SETTLE_MS = 637; // 950ms x 0.67

// Saturated accents (navy, orange, sky, yellow) that flash on some scrambling characters.
const ACCENTS = ['#185277', '#f5561f', '#92d3f9', '#fdd339'];
const ACCENT_CHANCE = 0.3; // per scrambling character, per tick

function randomChar() {
  return POOL[Math.floor(Math.random() * POOL.length)];
}

function randomAccent() {
  return Math.random() < ACCENT_CHANCE ? ACCENTS[Math.floor(Math.random() * ACCENTS.length)] : undefined;
}

export default function GlitchName({ name, className }: { name: string; className?: string }) {
  const [done, setDone] = useState(false);
  const [cells, setCells] = useState<{ ch: string; color?: string }[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = requestAnimationFrame(() => setDone(true));
      return () => cancelAnimationFrame(id);
    }
    const chars = [...name];
    // A fresh random settle time per letter = a different order every load.
    const settleAt = chars.map(() => MIN_SETTLE_MS + Math.random() * (MAX_SETTLE_MS - MIN_SETTLE_MS));
    const start = performance.now();
    let raf = 0;
    let last = -Infinity;

    const tick = (now: number) => {
      const t = now - start;
      if (now - last >= TICK_MS) {
        last = now;
        setCells(
          chars.map((ch, i) =>
            ch === ' ' || t >= settleAt[i] ? { ch } : { ch: randomChar(), color: randomAccent() },
          ),
        );
      }
      if (t < MAX_SETTLE_MS) raf = requestAnimationFrame(tick);
      else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [name]);

  return (
    <>
      <h1 className={`${className ?? ''} ${g.root}`} aria-label={name}>
        {/* Holds the final width/height so nothing shifts while letters decode. */}
        <span className={g.base} aria-hidden="true" data-hidden={!done || undefined}>
          {name}
        </span>
        {!done && (
          <span className={g.overlay} aria-hidden="true">
            {cells.map((c, i) => (
              <span key={i} style={c.color ? { color: c.color } : undefined}>
                {c.ch}
              </span>
            ))}
          </span>
        )}
      </h1>
      <noscript>
        <style>{`.${g.base}[data-hidden]{visibility:visible!important}`}</style>
      </noscript>
    </>
  );
}
