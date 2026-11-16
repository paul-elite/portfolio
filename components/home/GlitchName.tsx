'use client';

import { useEffect, useState } from 'react';
import g from './glitch.module.css';

// The home name types itself in like a terminal: each letter flickers through
// block/code glyphs before it locks, a cursor leads the way, and the finished
// word gets one short pixel-slice burst before it settles.
const GLYPHS = '█▓▒░▚▞▙▟<>/\\_#01';
const STEP_MS = 55; // one letter locks every step
const SCRAMBLE_MS = 40; // glyph flicker rate
const LOOKAHEAD = 3; // scrambled cells shown ahead of the cursor

type Phase = 'typing' | 'burst' | 'done';

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

export default function GlitchName({ name, className }: { name: string; className?: string }) {
  const [phase, setPhase] = useState<Phase>('typing');
  const [cells, setCells] = useState<{ ch: string; locked: boolean }[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = requestAnimationFrame(() => setPhase('done'));
      return () => cancelAnimationFrame(id);
    }
    const chars = [...name];
    const start = performance.now();
    let raf = 0;
    let lastScramble = 0;
    let burstTimer: ReturnType<typeof setTimeout> | undefined;

    const tick = (now: number) => {
      const locked = Math.min(chars.length, Math.floor((now - start) / STEP_MS));
      if (now - lastScramble >= SCRAMBLE_MS || locked === chars.length) {
        lastScramble = now;
        const visible = Math.min(chars.length, locked + LOOKAHEAD);
        setCells(
          chars.slice(0, visible).map((ch, i) =>
            i < locked || ch === ' ' ? { ch, locked: true } : { ch: randomGlyph(), locked: false },
          ),
        );
      }
      if (locked < chars.length) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase('burst');
        burstTimer = setTimeout(() => setPhase('done'), 420);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(burstTimer);
    };
  }, [name]);

  const animating = phase !== 'done';

  return (
    <>
    <h1 className={`${className ?? ''} ${g.root}`} aria-label={name} data-phase={phase}>
      {/* Holds the final width/height so nothing shifts while letters arrive. */}
      <span className={g.base} aria-hidden="true" data-hidden={animating || undefined}>
        {name}
      </span>
      {animating && (
        <span className={g.overlay} aria-hidden="true">
          {cells.map((c, i) => (
            <span key={i} className={c.locked ? undefined : g.glyph}>
              {c.ch}
            </span>
          ))}
          {phase === 'typing' && <span className={g.cursor} />}
        </span>
      )}
    </h1>
    <noscript>
      <style>{`.${g.base}[data-hidden]{visibility:visible!important}`}</style>
    </noscript>
    </>
  );
}
