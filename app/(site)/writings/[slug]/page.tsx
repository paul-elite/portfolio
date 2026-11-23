import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getWritingBySlug, getSiteConfig } from '@/lib/content-service';
import { tocFromBlocks } from '@/lib/toc';
import ContentBlocks from '@/components/content/ContentBlocks';
import { longDate } from '@/lib/dates';
import ArticleReader from '@/components/home/ArticleReader';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

export const revalidate = 60;


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const w = await getWritingBySlug(slug);
  const config = await getSiteConfig();
  const name = config.name || 'Paul Elite';
  return { title: w ? `${w.title} - ${name}` : name };
}

export default async function WritingContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const writing = await getWritingBySlug(slug);
  if (!writing) notFound();

  const toc = tocFromBlocks(writing.blocks);

  return (
    <ArticleReader title={writing.title} date={longDate(writing.date)} toc={toc}>
      {writing.description && <p>{writing.description}</p>}
      <ContentBlocks blocks={writing.blocks} />
      {writing.link && (
        <p>
          <a href={writing.link} target="_blank" rel="noopener noreferrer">Read the original <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={1.8} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} /></a>
        </p>
      )}
    </ArticleReader>
  );
}
