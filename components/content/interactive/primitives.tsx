'use client';

import type { ReactNode } from 'react';

// Shared pieces for the interactive essay demos: a quiet frame, icons and small controls in the
// site's grey palette, sized for the ~450px reading column.

export function DemoFrame({ label, caption, children }: { label: string; caption?: string; children: ReactNode }) {
  return (
    <figure aria-label={label} className="not-prose my-10">
      <div className="rounded-xl border border-gray-200/80 bg-white px-4 py-6 sm:px-8 sm:py-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-[420px]">{children}</div>
      </div>
      {caption && <figcaption className="mx-auto mt-3 max-w-[460px] text-center text-[13px] leading-relaxed text-gray-400">{caption}</figcaption>}
    </figure>
  );
}

/** A row of mutually exclusive options; keyboard: arrow keys move, Enter/Space picks (native radio group) */
export function Segmented<T extends string>({ name, options, value, onChange }: { name: string; options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
      {options.map(o => (
        <label key={o.value} className={`relative flex-1 min-w-fit cursor-pointer rounded-lg px-2.5 py-1.5 text-center text-xs transition-colors ${value === o.value ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only peer" />
          <span className="peer-focus-visible:underline underline-offset-4">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

export function Chip({ children, active, onClick, onRemove }: { children: ReactNode; active?: boolean; onClick?: () => void; onRemove?: () => void }) {
  const base = `inline-flex items-center gap-1 rounded-full border text-xs transition-colors ${active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`;
  if (onRemove) {
    return (
      <span className={`${base} pl-2.5 pr-1 py-0.5`}>
        {children}
        <button type="button" onClick={onRemove} aria-label={`Remove ${typeof children === 'string' ? children : 'filter'}`} className="rounded-full p-0.5 opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1">
          <XIcon />
        </button>
      </span>
    );
  }
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`${base} px-2.5 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400`}>
      {children}
    </button>
  );
}

export function Field({ children, scope }: { children: ReactNode; scope?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-100 transition-shadow">
      <SearchIcon className="text-gray-400 shrink-0" />
      {children}
      {scope && <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-500">{scope}</span>}
    </div>
  );
}

export const inputClass = 'w-full min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none';

/** Bold the part of `text` that matches `query` (case-insensitive) */
export function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-amber-100 text-gray-900 rounded-[3px] px-[1px]">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

type IconProps = { className?: string };
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const SearchIcon = ({ className }: IconProps) => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} className={className} aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const ClockIcon = ({ className }: IconProps) => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} className={className} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);
export const XIcon = ({ className }: IconProps) => (
  <svg width="12" height="12" viewBox="0 0 24 24" {...stroke} className={className} aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const ArrowIcon = ({ className }: IconProps) => (
  <svg width="12" height="12" viewBox="0 0 24 24" {...stroke} className={className} aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const LockIcon = ({ className }: IconProps) => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...stroke} className={className} aria-hidden><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);

/** A small product thumbnail: a tinted tile with a chair silhouette, so results have something to recognise */
export function ChairThumb({ tone = '#e7e1d8', shape = 'lounge', size = 36 }: { tone?: string; shape?: 'lounge' | 'office' | 'dining' | 'arm' | 'sofa'; size?: number }) {
  const paths: Record<string, string> = {
    lounge: 'M7 7c0-1.5 1-2.5 2.5-2.5h3C14 4.5 15 5.5 15 7v4h2.5c.8 0 1.5.7 1.5 1.5V15H5v-2.5C5 11.7 5.7 11 6.5 11H7V7ZM7 15v3M17 15v3',
    office: 'M8 4h8v7H8zM6 12h12M12 12v4M8 19l4-3 4 3',
    dining: 'M8 4v15M8 11h8v8M16 11V4M8 4h8',
    arm: 'M6 9a2 2 0 0 1 4 0v3h4V9a2 2 0 0 1 4 0v7H6V9ZM8 16v3M16 16v3',
    sofa: 'M4 10a2 2 0 0 1 4 0v2h8v-2a2 2 0 0 1 4 0v6H4v-6ZM6 16v2M18 16v2M8 8V6h8v2',
  };
  return (
    <span className="grid shrink-0 place-items-center rounded-lg" style={{ width: size, height: size, background: tone }} aria-hidden>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d={paths[shape]} />
      </svg>
    </span>
  );
}
