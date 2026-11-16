import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getWritingBySlug, getSiteConfig } from '@/lib/content-service';
import { tocFromBlocks } from '@/lib/toc';
import ContentBlocks from '@/components/content/ContentBlocks';
import ArticleReader from '@/components/home/ArticleReader';

export const revalidate = 60;

function longDate(iso?: string) {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const month = d.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' });
  return `${d.getUTCDate()} ${month}, ${d.getUTCFullYear()}`;
}

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
          <a href={writing.link} target="_blank" rel="noopener noreferrer">Read the original ↗</a>
        </p>
      )}
    </ArticleReader>
  );
}
