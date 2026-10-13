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

// One justified column of body copy, the last line of each paragraph left ragged
function Column({ x, y, width, count, start, lead, size = 5.4, gap = 7 }: {
  x: number; y: number; width: number; count: number; start: number; lead?: string; size?: number; gap?: number;
}) {
  const text = lines(Math.floor(width / (size * 0.41)), count, start, lead);
  return (
    <g fontFamily={SERIF} fontSize={size} fill="#3a3a3a">
      {text.map((t, i) => {
        const ragged = i === text.length - 1 || (i + 1) % 9 === 0;
        return (
          <text key={i} x={x} y={y + i * gap} {...(ragged ? {} : { textLength: width, lengthAdjust: 'spacing' as const })}>
            {ragged ? `${t}.` : t}
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

// Paper outline: a sheet with a gentle curl along its right and bottom edges
const SHEET = 'M0 0 H500 C503 110 505 240 499 352 C330 361 160 366 0 360 Z';

export default function Newspaper({ project, image }: { project: Project; image: string }) {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${k}-${uid}`;
  return (
    <svg viewBox="0 0 640 500" className="absolute inset-0 w-full h-full" role="img" aria-label={`${project.title} case study`}>
      <defs>
        <filter id={id('shadow')} x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="7" />
          <feOffset dx="2" dy="9" />
          <feComponentTransfer><feFuncA type="linear" slope="0.22" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id={id('sheet')}><path d={SHEET} /></clipPath>
        {/* Light falling across the paper, darker where it curls under */}
        <linearGradient id={id('shade')} x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.02" />
          <stop offset="1" stopColor="#000" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id={id('edge')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>
      </defs>

      {[
        { key: 'back', transform: 'translate(38 112) rotate(-9)' },
        { key: 'front', transform: 'translate(84 82) rotate(-3.2)' },
      ].map(({ key, transform }) => (
        <g key={key} transform={transform} filter={`url(#${id('shadow')})`}>
          {/* The folded pages underneath, showing at the edges */}
          <path d={SHEET} transform="translate(5 7)" fill="#dedede" />
          <path d={SHEET} transform="translate(2.5 3.5)" fill="#ececec" />
          <path d={SHEET} fill="#fbfbfa" />
          <g clipPath={`url(#${id('sheet')})`}>
            <FrontPage project={project} image={image} ids={{ photo: id(`photo-${key}`) }} />
            <rect x={0} y={0} width={510} height={370} fill={`url(#${id('shade')})`} />
            <rect x={0} y={0} width={510} height={370} fill={`url(#${id('edge')})`} />
          </g>
        </g>
      ))}
    </svg>
  );
}
