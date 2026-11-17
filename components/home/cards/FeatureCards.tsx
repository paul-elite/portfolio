'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import DesigningSearch from '@/components/stageshow/designing-search';
import c from './cards.module.css';

/* Stageshow-style feature cards: each card plays one short, looping piece of
   faux UI for a real Featured item. Every movement has a visible cause (a
   cursor, a tap, typing), loops end where they began, and everything stays
   mounted so it moves in and out instead of popping. Loops pause offscreen;
   reduced motion gets a single still frame. */

export type FeatureCardItem = {
  key: string;
  kind: 'chart' | 'search' | 'phone';
  title: string;
  cat: string;
  href: string;
  external?: boolean;
  screens?: string[];
};

/* ---------- shared timeline ---------- */

// Steps through `durations` (ms) forever; returns the current step index.
function useLoop(durations: number[], stillStep: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 });
    if (ref.current) io.observe(ref.current);
    return () => {
      mq.removeEventListener('change', sync);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!visible || reduced) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % durations.length), durations[step]);
    return () => clearTimeout(t);
  }, [step, visible, reduced, durations]);

  return { ref, step: reduced ? stillStep : step, reduced };
}

/* ---------- cursor: x and y ease differently, so moves travel in a shallow arc ---------- */

const u = (v: number | string) => (typeof v === 'number' ? `${v}px` : v);

function Cursor({ x, y, pressed, ms, hidden }: { x: number | string; y: number | string; pressed?: boolean; ms: number; hidden?: boolean }) {
  return (
    <div
      className={c.cursorX}
      style={{ transform: `translateX(${u(x)})`, transitionDuration: `${ms}ms`, opacity: hidden ? 0 : 1 } as CSSProperties}
      aria-hidden="true"
    >
      <div className={c.cursorY} style={{ transform: `translateY(${u(y)})`, transitionDuration: `${ms}ms` }}>
        <svg className={`${c.cursor} ${pressed ? c.cursorPressed : ''}`} width="18" height="22" viewBox="0 0 18 22">
          <path d="M2 1.5v16.2l4.3-4.1 2.8 6.3 2.9-1.3-2.8-6.2h6z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/* ---------- rolling number: only digits that change roll ---------- */

function Roll({ value, width }: { value: string; width: number }) {
  // Fixed width (figure-space padded) so columns never shift; keys count from the right.
  const chars = [...value.padStart(width, '\u2007')];
  return (
    <span className={c.roll} aria-label={value}>
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={chars.length - i} className={c.rollCol} aria-hidden="true">
            <span className={c.rollStrip} style={{ transform: `translateY(${-(Number(ch) * 1.8 + 0.325)}em)` }}>
              {'0123456789'.split('').map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={chars.length - i} aria-hidden="true">
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

/* ---------- 1. Essay: a cursor scrubs a line, the headline reads out each point ---------- */

const SERIES = [12, 18, 15, 24, 21, 33, 29, 41, 38, 52, 47, 61];
const W = 300;
const H = 132;
const PAD = 14;
const px = (i: number) => PAD + (i * (W - PAD * 2)) / (SERIES.length - 1);
const py = (v: number) => H - PAD - ((v - 8) / (64 - 8)) * (H - PAD * 2);
const LINE = SERIES.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ');
const AREA = `${LINE} L${px(SERIES.length - 1)} ${H} L${px(0)} ${H} Z`;
// rest -> enter -> scrub point by point -> hold -> leave
const CHART_STEPS = [700, 650, ...SERIES.map(() => 260), 900, 650];

function ChartDemo() {
  const N = SERIES.length;
  const { ref, step } = useLoop(CHART_STEPS, 2 + N - 1);
  // step 0: rest (cursor parked off the corner) · 1: glide to the first point
  // 2..2+N-1: scrub point by point · 2+N: hold on the last · 2+N+1: leave
  const idx = step >= 2 && step < 2 + N ? step - 2 : step === 2 + N ? N - 1 : -1;
  const reading = idx >= 0;
  const shown = reading ? SERIES[idx] : SERIES[N - 1];
  const at = step === 1 ? 0 : idx;
  const parked = at < 0;
  const cx = parked ? 108 : (px(at) / W) * 100;
  const cy = parked ? 112 : (py(SERIES[at]) / H) * 100;
  const ms = step === 1 ? 650 : step === 0 || step === 2 + N + 1 ? 600 : 240;

  return (
    <div ref={ref} className={`${c.stage} ${c.stageChart}`}>
      <div className={c.window}>
        <div className={c.chartHead}>
          <span className={c.chartLabel}>Records kept</span>
          <span className={c.chartValue}>
            <Roll value={(shown * 37).toLocaleString('en-US')} width={5} />
          </span>
          <span className={c.chartSub}>{reading ? `Week ${idx + 1}` : 'Last 12 weeks'}</span>
        </div>
        <div className={c.chartArea}>
          <svg className={c.chart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="fc-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#f5561f" stopOpacity="0.16" />
                <stop offset="1" stopColor="#f5561f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={AREA} fill="url(#fc-area)" />
            <path d={LINE} fill="none" stroke="#f5561f" strokeWidth="1.6" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            <g className={c.scrub} style={{ opacity: reading ? 1 : 0, transform: `translateX(${px(reading ? idx : N - 1)}px)` }}>
              <line x1="0" x2="0" y1={0} y2={H} stroke="rgba(0,0,0,0.18)" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
          <span
            className={c.scrubDot}
            style={{ left: `${(px(reading ? idx : N - 1) / W) * 100}%`, top: `${(py(SERIES[reading ? idx : N - 1]) / H) * 100}%`, opacity: reading ? 1 : 0 }}
          />
          <div className={c.cursorLayer}>
            <Cursor x={`${cx}%`} y={`${cy}%`} ms={ms} hidden={parked} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 2. Study: Designing Search, built with the Stageshow kit ---------- */

export function SearchDemo() {
  return (
    <div className={`${c.stage} ${c.stageKit}`}>
      <DesigningSearch />
    </div>
  );
}

/* ---------- 3. Design: a phone, cropped by the frame, tapped through its real screens ---------- */

function PhoneDemo({ screens }: { screens: string[] }) {
  const n = screens.length;
  // each screen: rest, tap, slide
  const steps = screens.flatMap(() => [1500, 260, 520]);
  const { ref, step } = useLoop(steps, 0);
  const screen = Math.floor(step / 3);
  const phase = step % 3;
  const showing = phase === 2 ? (screen + 1) % n : screen;
  const tapping = phase === 1;

  return (
    <div ref={ref} className={`${c.stage} ${c.stagePhone}`}>
      <div className={c.phone}>
        <div className={c.phoneScreen}>
          {screens.map((src, i) => (
            /* eslint-disable-next-line @next/next/no-img-element -- Supabase storage URLs */
            <img
              key={src}
              src={src}
              alt=""
              className={c.phoneImg}
              style={{ transform: `translateX(${(i - showing) * 100}%)`, opacity: Math.abs(i - showing) > 1 ? 0 : 1 }}
            />
          ))}
          <span className={`${c.tap} ${tapping ? c.tapOn : ''}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

/* ---------- card shell ---------- */

export default function FeatureCards({ items }: { items: FeatureCardItem[] }) {
  return (
    <div className={c.grid}>
      {items.map((it) => {
        const demo =
          it.kind === 'chart' ? <ChartDemo /> : it.kind === 'search' ? <SearchDemo /> : <PhoneDemo screens={it.screens ?? []} />;
        const body = (
          <>
            {demo}
            <span className={c.caption}>
              <span className={c.cat}>{it.cat}</span>
              <span className={c.title}>{it.title}</span>
            </span>
          </>
        );
        return it.external ? (
          <a key={it.key} className={c.card} href={it.href} target="_blank" rel="noopener noreferrer">
            {body}
          </a>
        ) : (
          <Link key={it.key} className={c.card} href={it.href}>
            {body}
          </Link>
        );
      })}
    </div>
  );
}
