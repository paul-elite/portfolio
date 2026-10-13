'use client';

import { useId } from 'react';
import type { Project } from '@/lib/content-model';

// A folded newspaper for case studies, drawn as vector: two papers, the front one carrying only the
// project's title, bold and flush left. Viewbox 640×500, room for the curl and shadows.

const INK = '#141414';
const GEIST = 'var(--font-geist), ui-sans-serif, system-ui, sans-serif';

// Page area for the title: inside a 32-unit margin on the 500×360 sheet
const MARGIN = 32;
const AREA_W = 500 - MARGIN * 2;
const AREA_H = 360 - MARGIN * 2;

// Wrap the title into lines, at the largest size (up to 76) that fits the page in four lines or fewer.
// Widths are estimated for Geist Bold with tight tracking (about 0.5em a character).
function setTitle(title: string): { size: number; lines: string[] } {
  const words = title.split(/\s+/).filter(Boolean);
  for (let size = 76; size >= 22; size -= 2) {
    const perLine = Math.floor(AREA_W / (size * 0.5));
    if (words.some(w => w.length > perLine)) continue;
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      if (line && (line + ' ' + w).length > perLine) { lines.push(line); line = w; } else line = line ? line + ' ' + w : w;
    }
    if (line) lines.push(line);
    if (lines.length <= 4 && lines.length * size * 1.02 <= AREA_H) return { size, lines };
  }
  return { size: 22, lines: words.length ? [title] : [] };
}

// The front page: just the title
function TitlePage({ title }: { title: string }) {
  const { size, lines } = setTitle(title || 'Case study');
  return (
    <text
      x={MARGIN}
      y={MARGIN + size * 0.82}
      fill={INK}
      style={{ fontFamily: GEIST, fontWeight: 700, fontSize: size, letterSpacing: '-0.045em' }}
    >
      {lines.map((l, i) => <tspan key={i} x={MARGIN} dy={i === 0 ? 0 : size * 1.0}>{l}</tspan>)}
    </text>
  );
}

// Paper outline: a sheet with a slightly bowed left edge and a gentle curl along its right and bottom
const SHEET = 'M0 0 H500 C503 110 505 240 499 352 C330 361 160 366 0 360 C-2.5 240 1.5 120 0 0 Z';
// Pages folded underneath, each peeking out a little further at the bottom and right
const STACK = [4, 3, 2, 1];

export default function Newspaper({ project }: { project: Project }) {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${k}-${uid}`;
  const url = (k: string) => `url(#${id(k)})`;
  return (
    <svg viewBox="0 0 640 500" className="absolute inset-0 w-full h-full" role="img" aria-label={`${project.title} case study`}>
      <defs>
        {/* Two shadows: a tight one where the paper meets the table, and a soft one further out */}
        <filter id={id('shadow')} x="-15%" y="-15%" width="135%" height="150%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.6" result="b1" />
          <feOffset in="b1" dx="0.6" dy="1.6" result="o1" />
          <feComponentTransfer in="o1" result="s1"><feFuncA type="linear" slope="0.3" /></feComponentTransfer>
          <feGaussianBlur in="SourceAlpha" stdDeviation="12" result="b2" />
          <feOffset in="b2" dx="5" dy="16" result="o2" />
          <feComponentTransfer in="o2" result="s2"><feFuncA type="linear" slope="0.17" /></feComponentTransfer>
          <feMerge><feMergeNode in="s2" /><feMergeNode in="s1" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Paper grain */}
        <filter id={id('grain')} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
        </filter>
        <clipPath id={id('sheet')}><path d={SHEET} /></clipPath>
        {/* Key light from the top right, falling off towards the lower left */}
        <radialGradient id={id('key')} cx="0.78" cy="0.08" r="0.95">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('falloff')} cx="0" cy="1" r="0.85">
          <stop offset="0" stopColor="#000" stopOpacity="0.09" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* The bottom curling under: darker into the bend, then a thin rim of light on the edge */}
        <linearGradient id={id('curl')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.74" stopColor="#000" stopOpacity="0" />
          <stop offset="0.9" stopColor="#000" stopOpacity="0.05" />
          <stop offset="0.975" stopColor="#000" stopOpacity="0.13" />
          <stop offset="0.99" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.05" />
          <stop offset="0.06" stopColor="#000" stopOpacity="0" />
          <stop offset="0.9" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.09" />
        </linearGradient>
        <linearGradient id={id('stack')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f2f0" />
          <stop offset="1" stopColor="#dcdcda" />
        </linearGradient>
      </defs>

      {[
        { key: 'back', transform: 'translate(38 112) rotate(-9)', dim: 0.05 },
        { key: 'front', transform: 'translate(84 82) rotate(-3.2)', dim: 0 },
      ].map(({ key, transform, dim }) => (
        <g key={key} transform={transform} filter={url('shadow')}>
          {STACK.map(n => (
            <path key={n} d={SHEET} transform={`translate(${n * 1.3} ${n * 1.9})`} fill={url('stack')} stroke="#c9c9c6" strokeWidth={0.35} />
          ))}
          <path d={SHEET} fill="#fcfcfa" />
          <g clipPath={url('sheet')}>
            <TitlePage title={project.title} />
            <rect x={-5} y={-5} width={515} height={375} filter={url('grain')} opacity={0.05} />
            <rect x={-5} y={-5} width={515} height={375} fill={url('falloff')} />
            <rect x={-5} y={-5} width={515} height={375} fill={url('key')} />
            <rect x={0} y={0} width={505} height={366} fill={url('side')} />
            <rect x={0} y={0} width={505} height={366} fill={url('curl')} />
            {dim > 0 && <rect x={-5} y={-5} width={515} height={375} fill="#000" opacity={dim} />}
          </g>
          {/* Crisp outline, and light catching the top edge */}
          <path d={SHEET} fill="none" stroke="#000" strokeOpacity={0.09} strokeWidth={0.5} />
          <path d="M1 0.6 H499" stroke="#fff" strokeWidth={0.9} strokeOpacity={0.9} />
        </g>
      ))}
    </svg>
  );
}
