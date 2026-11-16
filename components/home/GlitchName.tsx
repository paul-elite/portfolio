'use client';

import { useEffect, useState } from 'react';
import g from './glitch.module.css';

// The home name decodes itself: every letter shuffles through random letters
// and special symbols, then each one locks in at its own random moment, so the
// characters and the settle order differ on every load.
const SYMBOLS = '#%&@$§¶†‡※¤∆∑∂√∞≈≠±×÷<>{}[]/\\|~^*!?¿¡°•◊∫Ω≡';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const TICK_MS = 45; // how often unlocked letters change
const MIN_SETTLE_MS = 250;
const MAX_SETTLE_MS = 950;

function randomChar() {
  // Lean on symbols so it reads as a decode, with letters mixed in.
  const pool = Math.random() < 0.65 ? SYMBOLS : LETTERS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function GlitchName({ name, className }: { name: string; className?: string }) {
  const [done, setDone] = useState(false);
  const [cells, setCells] = useState<{ ch: string; locked: boolean }[]>([]);

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
            ch === ' ' || t >= settleAt[i] ? { ch, locked: true } : { ch: randomChar(), locked: false },
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
              <span key={i} className={c.locked ? undefined : g.glyph}>
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
