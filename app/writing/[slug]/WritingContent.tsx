'use client';

import Link from 'next/link';
import ContentBlocks from '@/components/content/ContentBlocks';
import DetailPageTransition from '@/components/experience/DetailPageTransition';
import type { NavItem, Writing } from '@/lib/content-model';

interface WritingContentProps {
  writing: Writing;
  prevWriting?: NavItem | null;
  nextWriting?: NavItem | null;
}

const link = 'underline decoration-zinc-100 decoration-2 underline-offset-2 hover:decoration-zinc-300';

export default function WritingContent({ writing, prevWriting, nextWriting }: WritingContentProps) {
  const hasBlocks = !!writing.blocks?.length;
  const date = writing.date ? new Date(writing.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  return (
    <DetailPageTransition>
      <main className="min-h-dvh flex-1 bg-white text-[15px] leading-[1.5] text-black">
        <article className="mx-auto w-full max-w-2xl px-8 py-24">
          <Link href="/?section=writing" data-detail-transition className="mb-8 inline-flex items-center gap-1 text-zinc-400 transition-[color] duration-150 hover:text-zinc-600">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 3L5 8l5 5" /></svg>
            Back
          </Link>

          <h1 className="font-medium text-balance">{writing.title}</h1>
          {date && <p className="text-zinc-400 tabular-nums">{date}</p>}

          {writing.cover && (
            <img src={writing.cover} alt="" className="mt-10 w-full bg-zinc-50 object-cover outline outline-1 -outline-offset-1 outline-black/10 md:-mx-28 md:w-[calc(100%+14rem)] md:max-w-none" />
          )}

          <div className="mt-10">
            {hasBlocks ? <ContentBlocks blocks={writing.blocks} variant="essay" /> : writing.description ? <p className="text-pretty">{writing.description}</p> : null}
          </div>

          {writing.link && (
            <a href={writing.link} target="_blank" rel="noopener noreferrer" className={`mt-10 inline-block ${link}`}>Read the full piece</a>
          )}

          {(prevWriting || nextWriting) && (
            <nav className="mt-20 flex justify-between gap-6 border-t border-zinc-100 pt-6" aria-label="More writing">
              {prevWriting ? (
                <Link href={`/writing/${prevWriting.slug}`} data-detail-transition className="flex min-w-0 flex-col">
                  <span className="text-zinc-400">Previous</span>
                  <span className={`truncate ${link}`}>{prevWriting.title}</span>
                </Link>
              ) : <span />}
              {nextWriting ? (
                <Link href={`/writing/${nextWriting.slug}`} data-detail-transition className="flex min-w-0 flex-col items-end text-right">
                  <span className="text-zinc-400">Next</span>
                  <span className={`truncate ${link}`}>{nextWriting.title}</span>
                </Link>
              ) : <span />}
            </nav>
          )}
        </article>
      </main>
    </DetailPageTransition>
  );
}
