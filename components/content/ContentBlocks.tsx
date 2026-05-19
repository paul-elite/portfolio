'use client';

import OptimizedImage from '@/components/OptimizedImage';
import type { ContentBlock } from '@/lib/content-model';

interface ContentBlocksProps {
  blocks?: ContentBlock[];
}

export default function ContentBlocks({ blocks = [] }: ContentBlocksProps) {
  return (
    <>
      {blocks.map((block, index) => (
        <ContentBlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </>
  );
}

function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="text-base font-semibold text-gray-900 mt-8 mb-4">
          {block.content}
        </h2>
      );
    case 'text':
      return (
        <p className="text-base text-gray-600 leading-relaxed mb-4">
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
        <blockquote className="border-l-2 border-gray-200 pl-4 my-6 text-gray-500 italic">
          {block.content}
        </blockquote>
      );
    case 'code':
      return (
        <pre className="bg-gray-50 rounded-lg p-4 my-6 overflow-x-auto text-sm">
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
            <li key={`${item}-${index}`} className="flex items-start gap-3 text-base text-gray-600">
              <span className={bullets[index] ? 'mt-0.5' : 'text-gray-400 mt-1.5'}>
                {bullets[index] || '•'}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    default:
      return null;
  }
}
