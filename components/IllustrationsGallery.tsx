'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import type { Illustration } from '@/lib/content-model';

const dimensions: Record<number, [number, number]> = {
  1: [1, 1], 2: [2, 1], 3: [3, 1], 4: [2, 2], 6: [3, 2], 9: [3, 3],
};

export default function IllustrationsGallery({ illustrations }: { illustrations: Illustration[] }) {
  const [selected, setSelected] = useState<Illustration | null>(null);
  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  return (
    <div className="h-full overflow-y-auto px-3 py-10 md:px-8 md:py-16">
      <div className="mx-auto w-full max-w-[880px]">
        <Link href="/" className="mb-10 inline-flex text-sm text-gray-400 transition-colors hover:text-gray-900">← Back</Link>
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-gray-900">Illustrations</h1>
        <div className="grid grid-cols-3 grid-flow-row-dense gap-2 md:gap-3">
          {illustrations.map((item) => {
            const span = dimensions[item.gridSpan || 1] || dimensions[1];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item)}
                aria-label={`View ${item.title} in full`}
                className="group relative min-w-0 overflow-hidden rounded-lg bg-neutral-100 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ gridColumn: `span ${span[0]}`, gridRow: `span ${span[1]}`, aspectRatio: `${span[0]} / ${span[1]}` }}
              >
                {item.thumbnail ? (
                  <OptimizedImage src={item.thumbnail} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="(max-width: 768px) 100vw, 880px" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center p-3 text-center text-xs text-gray-400">{item.title}</span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-8 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">{item.title}</span>
              </button>
            );
          })}
        </div>
        {illustrations.length === 0 && <p className="text-sm text-gray-400">Illustrations will appear here.</p>}
      </div>
      {selected && (
        <div role="dialog" aria-modal="true" aria-label={selected.title} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-5 md:p-12" onClick={() => setSelected(null)}>
          <button type="button" className="absolute right-5 top-5 rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20" onClick={() => setSelected(null)}>Close ×</button>
          <div className="flex max-h-full max-w-full flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            {selected.thumbnail && <img src={selected.thumbnail} alt={selected.title} className="max-h-[78dvh] max-w-full object-contain" />}
            <div className="text-center text-white"><h2 className="text-base font-medium">{selected.title}</h2>{selected.description && <p className="mt-1 text-sm text-white/60">{selected.description}</p>}</div>
            {selected.youtubeUrl && <a href={selected.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-white underline">Watch animation ↗</a>}
          </div>
        </div>
      )}
    </div>
  );
}
