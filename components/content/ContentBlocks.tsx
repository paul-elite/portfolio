'use client';

import OptimizedImage from '@/components/OptimizedImage';
import type { ContentBlock } from '@/lib/content-model';
import { headingId } from '@/lib/toc';
import InteractiveBlock from '@/components/content/interactive/InteractiveBlock';

interface ContentBlocksProps {
  blocks?: ContentBlock[];
  /** 'essay': larger reading type for long-form case studies */
  variant?: 'default' | 'essay';
}

type Variant = NonNullable<ContentBlocksProps['variant']>;

const TYPE: Record<Variant, { heading: string; text: string; quote: string; list: string; code: string }> = {
  default: {
    heading: 'text-base font-semibold text-gray-900 mt-8 mb-4',
    text: 'text-sm text-gray-600 leading-relaxed mb-4',
    quote: 'border-l-2 border-gray-200 pl-4 my-6 text-gray-500 italic',
    list: 'flex items-start gap-3 text-sm text-gray-600',
    code: 'bg-gray-50 rounded-lg p-4 my-6 overflow-x-auto text-sm',
  },
  essay: {
    heading: 'text-[15px] font-semibold text-gray-900 mt-14 mb-3 tracking-[-0.01em]',
    text: 'text-[15px] text-gray-600 leading-7 mb-5',
    quote: 'border-l-2 border-gray-300 pl-4 my-8 text-[17px] leading-7 text-gray-900',
    list: 'flex items-start gap-3 text-[15px] leading-7 text-gray-600',
    code: 'bg-gray-50 border border-gray-200/70 rounded-xl px-4 py-3.5 my-6 overflow-x-auto text-[12.5px] leading-6 text-gray-700',
  },
};

export default function ContentBlocks({ blocks = [], variant = 'default' }: ContentBlocksProps) {
  return (
    <>
      {blocks.map((block, index) => (
        <ContentBlockView key={`${block.type}-${index}`} block={block} type={TYPE[variant]} />
      ))}
    </>
  );
}

function ContentBlockView({ block, type }: { block: ContentBlock; type: (typeof TYPE)[Variant] }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 id={headingId(block.content)} className={`${type.heading} scroll-mt-24`}>
          {block.content}
        </h2>
      );
    case 'text':
      return (
        <p className={type.text}>
          {block.content}
        </p>
      );
    case 'image':
      return (
        <figure className="my-6 rounded-lg overflow-hidden">
          <OptimizedImage
            src={block.content}
            alt={block.meta?.alt || ''}
            width={800}
            height={600}
            className="w-full h-auto"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {block.meta?.caption && (
            <figcaption className="mt-2 text-xs text-gray-400">
              {block.meta.caption}
            </figcaption>
          )}
        </figure>
      );
    case 'quote':
      return (
        <blockquote className={type.quote}>
          {block.content}
        </blockquote>
      );
    case 'code':
      return (
        <pre className={type.code}>
          <code>{block.content}</code>
        </pre>
      );
    case 'svg':
      return (
        <div className="my-6" dangerouslySetInnerHTML={{ __html: block.content }} />
      );
    case 'list': {
      const items = block.meta?.listItems || block.content.split('\n').filter((item) => item.trim());
      const bullets = block.meta?.listBullets || [];

      return (
        <ul className="my-4 space-y-2">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className={type.list}>
              <span className={bullets[index] ? 'mt-0.5' : 'text-gray-400 mt-1.5'}>
                {bullets[index] || '•'}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    case 'interactive':
      return <InteractiveBlock id={block.content} />;
    default:
      return null;
  }
}
