'use client';

import { useId } from 'react';
import type { Project } from '@/lib/content-model';

// A folded newspaper for case studies, drawn as vector: two papers, the front one carrying the
// project as its front page (title as the headline, role and year in the band, preview image as
// the photo, description leading the copy). Viewbox 640×500, room for the curl and shadows.

const SERIF = 'Georgia, "Times New Roman", Times, serif';
const SANS = '"Helvetica Neue", Arial, sans-serif';
const INK = '#141414';
const RED = '#c3161c';
const BLUE = '#28409a';

const LOREM = 'Lorem ipsum dolor sit amet consectetur adipiscing elit duis iaculis lacinia odio a feugiat fusce quis laoreet nisl id consectetur tortor vivamus malesuada libero non congue iaculis in tempus nulla iaculis ante pellentesque porttitor maecenas at lacus et eros tristique condimentum sed mollis consequat est vitae maximus purus suspendisse at feugiat tellus nec placerat arcu nullam sed ligula luctus cursus ligula nec varius nisl pellentesque ut lorem a urna aliquet eros eu congue ut vitae tellus et enim viverra imperdiet donec ornare ante turpis in fermentum ante facilisis in fusce eget aliquam dui in tincidunt sapien'.split(' ');

// Break text into lines of about `chars` characters; the words wrap on from `start` so columns differ
function lines(chars: number, count: number, start = 0, lead = ''): string[] {
  const words = [...lead.split(/\s+/).filter(Boolean), ...LOREM.slice(start % LOREM.length), ...LOREM, ...LOREM, ...LOREM];
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    if (out.length === count) break;
    if ((line + ' ' + w).trim().length > chars) { out.push(line.trim()); line = w; } else line += ' ' + w;
  }
  return out;
}

// A paragraph's last line, cut short so it ends partway across the column
const shorten = (t: string, max: number) => t.split(' ').reduce((acc, w) => ((acc + ' ' + w).trim().length <= max ? (acc + ' ' + w).trim() : acc), '');

// One justified column of body copy, the last line of each paragraph left ragged
function Column({ x, y, width, count, start, lead, size = 5.4, gap = 7 }: {
  x: number; y: number; width: number; count: number; start: number; lead?: string; size?: number; gap?: number;
}) {
  const chars = Math.floor(width / (size * 0.41));
  const text = lines(chars, count, start, lead);
  return (
    <g fontFamily={SERIF} fontSize={size} fill="#3a3a3a">
      {text.map((t, i) => {
        const ragged = i === text.length - 1 || (i + 1) % 9 === 0;
        return (
          <text key={i} x={x} y={y + i * gap} {...(ragged ? {} : { textLength: width, lengthAdjust: 'spacing' as const })}>
            {ragged ? `${shorten(t, Math.floor(chars * 0.6))}.` : t}
          </text>
        );
      })}
    </g>
  );
}

function Subhead({ x, y, children }: { x: number; y: number; children: string }) {
  return <text x={x} y={y} fontFamily={SERIF} fontSize={6.4} fontWeight={700} fill={INK}>{children}</text>;
}

// The front page, 500 wide; shared by both papers
function FrontPage({ project, image, ids }: { project: Project; image: string; ids: { photo: string } }) {
  const title = (project.title || 'Case study').toUpperCase();
  const band = [project.role, project.year, project.title].filter(Boolean).join('  ·  ') || 'Design  ·  Research  ·  Prototype';
  const lead = project.description || '';
  const sub = lead ? lead.split(/\s+/).slice(0, 4).join(' ') : 'Lorem ipsum dolor';
  return (
    <g>
      <line x1={18} x2={482} y1={14} y2={14} stroke={INK} strokeWidth={0.8} />
      <text x={18} y={10} fontFamily={SANS} fontSize={4.6} fill="#555" letterSpacing={0.4}>VOL. XII · NO. 214</text>
      <text x={482} y={10} fontFamily={SANS} fontSize={4.6} fill="#555" textAnchor="end" letterSpacing={0.4}>CASE STUDY EDITION</text>
      {/* Masthead */}
      <text x={20} y={66} fontFamily={SERIF} fontSize={54} fill={INK} letterSpacing={-1}>
        The Daily <tspan fill={RED}>Case</tspan>
      </text>
      <line x1={18} x2={482} y1={75} y2={75} stroke={INK} strokeWidth={0.6} />
      {/* Band */}
      <rect x={18} y={78} width={464} height={15} fill={BLUE} />
      <text x={250} y={89} fontFamily={SERIF} fontSize={9.5} fill="#fff" textAnchor="middle" letterSpacing={0.6}>{band}</text>
      {/* Photo, with its label */}
      <clipPath id={ids.photo}><rect x={18} y={100} width={208} height={98} /></clipPath>
      <rect x={18} y={100} width={208} height={98} fill="#bdbdbd" />
      {image && <image href={image} x={18} y={100} width={208} height={98} preserveAspectRatio="xMidYMid slice" clipPath={`url(#${ids.photo})`} />}
      <rect x={24} y={176} width={92} height={16} fill={BLUE} />
      <text x={70} y={187.5} fontFamily={SERIF} fontSize={10} fill="#fff" textAnchor="middle" letterSpacing={0.4}>CASE STUDY</text>
      {/* Headline */}
      <text x={236} y={117} fontFamily={SERIF} fontSize={25} fill={INK} textLength={246} lengthAdjust="spacingAndGlyphs">{title}</text>
      {/* Copy: two columns beside the photo, two under it, and one more on the right */}
      <Subhead x={236} y={131}>{sub}</Subhead>
      <Column x={236} y={139} width={116} count={16} start={0} lead={lead} />
      <Column x={364} y={131} width={118} count={9} start={23} />
      <Subhead x={364} y={199}>Lorem ipsum dolor</Subhead>
      <Column x={364} y={207} width={118} count={19} start={57} />
      <text x={18} y={210} fontFamily={SERIF} fontSize={6} fontStyle="italic" fill="#333" textLength={208} lengthAdjust="spacingAndGlyphs">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis iaculis.</text>
      <Column x={18} y={221} width={98} count={18} start={11} />
      <Column x={128} y={221} width={98} count={18} start={40} />
      <Column x={236} y={256} width={116} count={13} start={75} />
    </g>
  );
}

// Paper outline: a sheet with a slightly bowed left edge and a gentle curl along its right and bottom
const SHEET = 'M0 0 H500 C503 110 505 240 499 352 C330 361 160 366 0 360 C-2.5 240 1.5 120 0 0 Z';
// Pages folded underneath, each peeking out a little further at the bottom and right
const STACK = [4, 3, 2, 1];

export default function Newspaper({ project, image }: { project: Project; image: string }) {
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
            <FrontPage project={project} image={image} ids={{ photo: id(`photo-${key}`) }} />
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
