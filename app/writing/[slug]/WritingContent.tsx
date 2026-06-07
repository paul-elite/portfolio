'use client';

import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import ContentBlocks from '@/components/content/ContentBlocks';
import DetailPageTransition from '@/components/experience/DetailPageTransition';
import type { NavItem, Writing } from '@/lib/content-model';

interface WritingContentProps {
  writing: Writing;
  prevWriting?: NavItem | null;
  nextWriting?: NavItem | null;
}

export default function WritingContent({ writing, prevWriting, nextWriting }: WritingContentProps) {
  const hasBlocks = writing.blocks && writing.blocks.length > 0;

  return (
    <DetailPageTransition>
      <div className="w-full pl-2 pr-3 md:px-6">
        {/* Main Content */}
        <div className="pt-24 md:pt-48 pb-16 flex md:grid md:grid-cols-12 gap-4 md:gap-6">
          <div className="hidden md:block md:col-span-3" />

          {/* Back Button */}
          <div className="flex-shrink-0 md:col-span-1 md:flex md:justify-end md:items-start">
            <Link
              href="/"
              data-detail-transition
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all hover:opacity-80"
              style={{
                background: 'linear-gradient(to bottom, #fefeff, #ffffff)',
                boxShadow: 'inset 0 1px 0.5px rgba(255, 255, 255, 1), 0 0 0 0.5px rgba(0, 0, 0, 0.05)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          </div>

          {/* Content Column */}
          <div className="flex-1 min-w-0 md:col-span-4">
            {/* Writing Title */}
            <div className="h-auto md:h-14 mb-4 md:mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                {writing.title}
              </h1>
              <div className="flex gap-4 text-sm text-gray-400">
                {writing.date && (
                  <span>
                    {new Date(writing.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Cover Image */}
            {writing.cover && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <OptimizedImage
                  src={writing.cover}
                  alt={writing.title}
                  width={800}
                  height={450}
                  className="w-full h-auto"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}

            {/* Block Content */}
            {hasBlocks && (
              <div className="prose prose-gray max-w-none">
                <ContentBlocks blocks={writing.blocks} />
              </div>
            )}

            {/* Description fallback if no blocks */}
            {!hasBlocks && writing.description && (
              <p className="text-sm text-gray-600 leading-relaxed">
                {writing.description}
              </p>
            )}

            {/* Link */}
            {writing.link && (
              <a
                href={writing.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-gray-900 transition-colors mt-12 inline-block"
              >
                Read More →
              </a>
            )}

            {/* Writing Navigation */}
            {(prevWriting || nextWriting) && (
              <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-100">
                {prevWriting ? (
                  <Link
                    href={`/writing/${prevWriting.slug}`}
                    data-detail-transition
                    className="group flex flex-col items-start"
                  >
                    <span className="text-xs text-gray-400 mb-1">Previous Writing</span>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                      ← {prevWriting.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {nextWriting ? (
                  <Link
                    href={`/writing/${nextWriting.slug}`}
                    data-detail-transition
                    className="group flex flex-col items-end"
                  >
                    <span className="text-xs text-gray-400 mb-1">Next Writing</span>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                      {nextWriting.title} →
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>

          <div className="hidden md:block md:col-span-3" />
        </div>
      </div>
    </DetailPageTransition>
  );
}
