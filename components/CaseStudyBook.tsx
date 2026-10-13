'use client';

import { useId } from 'react';

// Case study artwork: a hardback book (after "Frame 1171281055.svg"), its cover carrying the title in
// Geist Bold, centred above the colour wheel. Viewbox 116×132: the book plus its soft shadow.

const TITLE = '#4B678E';
const GEIST = 'var(--font-geist), ui-sans-serif, system-ui, sans-serif';

// The title sits centred in the band above the wheel: 72 wide, from y 14 to 44
const CENTRE_X = 48;
const TOP = 14;
const BAND_W = 72;
const BAND_H = 30;

// Wrap the title at the largest size (up to 11.6, the artwork's) that fits the band in three lines or
// fewer; widths are estimated for Geist Bold with tight tracking (about 0.52em a character)
function setTitle(title: string): { size: number; lines: string[] } {
  const words = title.split(/\s+/).filter(Boolean);
  for (let size = 11.6; size >= 5; size -= 0.2) {
    const perLine = Math.floor(BAND_W / (size * 0.52));
    if (words.some(w => w.length > perLine)) continue;
    const lines: string[] = [];
    let line = '';
    for (const w of words) {
      if (line && (line + ' ' + w).length > perLine) { lines.push(line); line = w; } else line = line ? `${line} ${w}` : w;
    }
    if (line) lines.push(line);
    if (lines.length <= 3 && lines.length * size * 1.05 <= BAND_H) return { size, lines };
  }
  return { size: 5, lines: [title] };
}

export default function CaseStudyBook({ title }: { title: string }) {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${k}-${uid}`;
  const url = (k: string) => `url(#${id(k)})`;
  const { size, lines } = setTitle(title || 'Case study');
  // Centre the block of lines vertically in the band
  const first = TOP + (BAND_H - lines.length * size * 1.05) / 2 + size * 0.8;
  return (
    <svg viewBox="0 0 116 132" fill="none" className="absolute inset-0 w-full h-full" role="img" aria-label={`${title} case study`}>
      <defs>
        {/* The artwork's four layered shadows, cool grey-blue */}
        <filter id={id('shadow')} x="0" y="0" width="120" height="156" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="1" dy="2" />
          <feGaussianBlur stdDeviation="2.5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.25098 0 0 0 0 0.32549 0 0 0 0 0.447059 0 0 0 0.11 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="s1" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="4" dy="7" />
          <feGaussianBlur stdDeviation="4" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.25098 0 0 0 0 0.32549 0 0 0 0 0.447059 0 0 0 0.09 0" />
          <feBlend mode="normal" in2="s1" result="s2" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="8" dy="17" />
          <feGaussianBlur stdDeviation="5.5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.25098 0 0 0 0 0.32549 0 0 0 0 0.447059 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="s2" result="s3" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dx="15" dy="30" />
          <feGaussianBlur stdDeviation="6.5" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.25098 0 0 0 0 0.32549 0 0 0 0 0.447059 0 0 0 0.02 0" />
          <feBlend mode="normal" in2="s3" result="s4" />
          <feBlend mode="normal" in="SourceGraphic" in2="s4" result="shape" />
        </filter>
        <linearGradient id={id('cover')} x1="32.075" y1="3.5" x2="60.8969" y2="113.295" gradientUnits="userSpaceOnUse">
          <stop offset="0.411568" stopColor="#F6F6F6" />
          <stop offset="1" stopColor="#E8EDF0" />
        </linearGradient>
        <clipPath id={id('clip')}>
          <rect x="4.5" y="3.5" width="87" height="109" rx="4" fill="white" />
        </clipPath>
      </defs>
      <g filter={url('shadow')}>
        <g clipPath={url('clip')}>
          <rect x="4.5" y="3.5" width="87" height="109" rx="4" fill={url('cover')} />
          {/* Spine */}
          <path d="M7.5 -6.75V129.25" stroke="black" strokeOpacity="0.05" />
          <path d="M9.5 -6.75V129.25" stroke="black" strokeOpacity="0.05" />
          <text
            fill={TITLE}
            textAnchor="middle"
            style={{ fontFamily: GEIST, fontWeight: 700, fontSize: size, letterSpacing: '-0.035em' }}
          >
            {lines.map((l, i) => <tspan key={i} x={CENTRE_X} y={first + i * size * 1.05}>{l}</tspan>)}
          </text>
          {/* Colour wheel */}
          <path d="M58.3782 61.6722C57.3519 59.9676 55.8966 58.5505 54.1621 57.57L57.8494 51.1836C60.7029 52.8112 63.091 55.1616 64.7648 57.9849L58.3782 61.6722Z" fill="#FCD121" />
          <path fillRule="evenodd" clipRule="evenodd" d="M48.5 56.0867V48.7139C51.9007 48.7139 55.0914 49.6125 57.8479 51.1848L54.1606 57.5712C52.4888 56.6262 50.5574 56.0867 48.5 56.0867Z" fill="#FCED23" />
          <path fillRule="evenodd" clipRule="evenodd" d="M48.5004 48.7139V56.0867C46.443 56.0867 44.5114 56.6262 42.8396 57.5712L39.1523 51.1848C41.9088 49.6121 45.0998 48.7139 48.5004 48.7139Z" fill="#CFE82C" />
          <path fillRule="evenodd" clipRule="evenodd" d="M39.1515 51.1836L42.8388 57.57C41.1043 58.5505 39.6492 59.9676 38.623 61.6722L32.2363 57.9849C33.9101 55.1616 36.298 52.8117 39.1515 51.1836Z" fill="#14BF0E" />
          <path fillRule="evenodd" clipRule="evenodd" d="M29.6094 67.3741C29.6503 63.9478 30.6036 60.7406 32.2376 57.9844L38.6242 61.6717C37.618 63.343 37.024 65.2906 36.9831 67.3741H29.6094Z" fill="#22BAFD" />
          <path fillRule="evenodd" clipRule="evenodd" d="M36.9802 67.6068C36.9802 69.6341 37.504 71.5394 38.4234 73.194L32.0367 76.8813C30.4901 74.1417 29.6074 70.9773 29.6074 67.6068L29.6088 67.376H36.9825C36.9809 67.4529 36.9802 67.5299 36.9802 67.6068Z" fill="#0184FE" />
          <path fillRule="evenodd" clipRule="evenodd" d="M32.0371 76.8816L38.4237 73.1943C39.4191 74.9858 40.8789 76.4843 42.64 77.5269L38.9529 83.9133C36.0729 82.2231 33.6803 79.7918 32.0371 76.8816Z" fill="#3F01A2" />
          <path fillRule="evenodd" clipRule="evenodd" d="M48.4988 79.1275V86.5003C45.0158 86.5003 41.7529 85.5576 38.9512 83.9137L42.6382 77.5273C44.3552 78.5439 46.3588 79.1275 48.4988 79.1275Z" fill="#8701B0" />
          <path fillRule="evenodd" clipRule="evenodd" d="M48.5 86.5003V79.1275C50.64 79.1275 52.6436 78.5439 54.3606 77.5273L58.0476 83.9137C55.2459 85.5576 51.983 86.5003 48.5 86.5003Z" fill="#FB3D9F" />
          <path fillRule="evenodd" clipRule="evenodd" d="M54.3594 77.5269C56.1207 76.4843 57.58 74.9862 58.5757 73.1943L64.9623 76.8816C63.3191 79.7922 60.9267 82.2231 58.0465 83.9133L54.3594 77.5269Z" fill="#FF1A12" />
          <path fillRule="evenodd" clipRule="evenodd" d="M60.0171 67.376H67.3908L67.3921 67.6068C67.3921 70.9773 66.5094 74.1417 64.9628 76.8813L58.5762 73.194C59.4957 71.5394 60.0193 69.6341 60.0193 67.6068C60.0193 67.5299 60.0186 67.4529 60.0171 67.376Z" fill="#FD6B2C" />
          <path fillRule="evenodd" clipRule="evenodd" d="M67.3899 67.3741H60.0162C59.9752 65.2906 59.3812 63.343 58.375 61.6717L64.7616 57.9844C66.3956 60.7406 67.3489 63.9478 67.3899 67.3741Z" fill="#FA9B03" />
          {/* Page block */}
          <rect x="4.5" y="103.5" width="93" height="10" rx="5" fill="#B1C1C8" />
          <path d="M7.5 106.5H87.5" stroke="#93A0A5" strokeOpacity="0.5" strokeLinecap="round" />
          <path d="M7.5 108.5H87.5" stroke="#93A0A5" strokeOpacity="0.5" strokeLinecap="round" />
          <path d="M7.5 110.5H87.5" stroke="#93A0A5" strokeOpacity="0.5" strokeLinecap="round" />
        </g>
        <rect x="4.25" y="3.25" width="87.5" height="109.5" rx="4.25" stroke="#E6E6E6" strokeWidth="0.5" />
      </g>
    </svg>
  );
}
