'use client';

import { SEARCH_DEMOS } from './SearchDemos';

// Interactive blocks are referenced from content by id (block.content), so essays can place live demos
// between paragraphs. Unknown ids render nothing.
export const INTERACTIVE_COMPONENTS = { ...SEARCH_DEMOS } as const;

export type InteractiveId = keyof typeof INTERACTIVE_COMPONENTS;

export default function InteractiveBlock({ id }: { id: string }) {
  const Demo = INTERACTIVE_COMPONENTS[id as InteractiveId];
  return Demo ? <Demo /> : null;
}
