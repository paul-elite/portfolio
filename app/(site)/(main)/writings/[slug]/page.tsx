import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getWritingBySlug, getSiteConfig } from '@/lib/content-service';
import ContentBlocks from '@/components/content/ContentBlocks';
import shell from '@/components/home/shell.module.css';

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

  return (
    <section className={shell.pane}>
      <article className={shell.section}>
        <h1 className={shell.sectionTitle}>{writing.title}</h1>
        {writing.description && <p>{writing.description}</p>}
        <ContentBlocks blocks={writing.blocks} />
        {writing.link && (
          <p>
            <a href={writing.link} target="_blank" rel="noopener noreferrer">Read the original ↗</a>
          </p>
        )}
      </article>
    </section>
  );
}
