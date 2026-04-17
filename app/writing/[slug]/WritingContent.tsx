'use client';

import Link from 'next/link';
import OptimizedImage from '@/components/OptimizedImage';
import { Writing } from '@/lib/data';

interface ContentBlock {
  type: string;
  content: string;
  meta?: Record<string, unknown>;
}

interface WritingWithBlocks extends Writing {
  blocks?: ContentBlock[];
}

interface WritingNav {
  slug: string;
  title: string;
}

interface WritingContentProps {
  writing: WritingWithBlocks;
  prevWriting?: WritingNav | null;
  nextWriting?: WritingNav | null;
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={index} className="text-base font-semibold text-gray-900 mt-8 mb-4">
          {block.content}
        </h2>
      );
    case 'text':
      return (
        <p key={index} className="text-base text-gray-600 leading-relaxed mb-4">
          {block.content}
        </p>
      );
    case 'image':
      return (
        <div key={index} className="my-6 rounded-lg overflow-hidden">
          <OptimizedImage
            src={block.content}
            alt=""
            width={800}
            height={600}
            className="w-full h-auto"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      );
    case 'quote':
      return (
        <blockquote key={index} className="border-l-2 border-gray-200 pl-4 my-6 text-gray-500 italic">
          {block.content}
        </blockquote>
      );
    case 'code':
      return (
        <pre key={index} className="bg-gray-50 rounded-lg p-4 my-6 overflow-x-auto text-sm">
          <code>{block.content}</code>
        </pre>
      );
    case 'svg':
      return (
        <div key={index} className="my-6" dangerouslySetInnerHTML={{ __html: block.content }} />
      );
    default:
      return null;
  }
}

export default function WritingContent({ writing, prevWriting, nextWriting }: WritingContentProps) {
  const hasBlocks = writing.blocks && writing.blocks.length > 0;

  return (
    <main className="min-h-screen bg-white">
      <div className="w-full pl-2 pr-3 md:px-6">
        {/* Main Content */}
        <div className="pt-24 md:pt-48 pb-16 flex md:grid md:grid-cols-12 gap-4 md:gap-6">
          <div className="hidden md:block md:col-span-3" />

          {/* Back Button */}
          <div className="flex-shrink-0 md:col-span-1 md:flex md:justify-end md:items-start">
            <Link
              href="/"
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
            <div className="h-auto md:h-14 mb-6 md:mb-8">
              <h1 className="text-xl font-semibold text-gray-900">
                {writing.title}
              </h1>
              <div className="flex gap-4 text-sm text-gray-400 mt-1">
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
                {writing.blocks!.map((block, index) => renderBlock(block, index))}
              </div>
            )}

            {/* Description fallback if no blocks */}
            {!hasBlocks && writing.description && (
              <p className="text-base text-gray-600 leading-relaxed">
                {writing.description}
              </p>
            )}

            {/* Writing Navigation */}
            {(prevWriting || nextWriting) && (
              <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-100">
                {prevWriting ? (
                  <Link
                    href={`/writing/${prevWriting.slug}`}
                    className="group flex flex-col items-start"
                  >
                    <span className="text-xs text-gray-400 mb-1">Previous</span>
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
                    className="group flex flex-col items-end"
                  >
                    <span className="text-xs text-gray-400 mb-1">Next</span>
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
    </main>
  );
}
