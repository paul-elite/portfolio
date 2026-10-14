import type { ContentBlock } from './content-model';

/** A stable anchor id for a heading, e.g. "Make search accessible" → "make-search-accessible" */
export function headingId(text: string): string {
  return text.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

/** The headings a reader can jump to; a heading with meta.toc === false (a closing passage) is left out */
export function tocFromBlocks(blocks: ContentBlock[] = []): { id: string; label: string }[] {
  return blocks
    .filter(b => b.type === 'heading' && b.meta?.toc !== false && b.content.trim())
    .map(b => ({ id: headingId(b.content), label: b.content }));
}
