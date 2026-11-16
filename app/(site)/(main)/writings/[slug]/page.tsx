import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Newsreader } from 'next/font/google';
import { getWritingBySlug, getSiteConfig } from '@/lib/content-service';
import ContentBlocks from '@/components/content/ContentBlocks';
import shell from '@/components/home/shell.module.css';

export const revalidate = 60;

// The bulk of a writing reads in a serif face.
const serif = Newsreader({ subsets: ['latin'], weight: ['400', '500'], display: 'swap' });

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
        <div className={serif.className} style={{ fontSize: '18px', lineHeight: 1.65 }}>
          {writing.description && <p>{writing.description}</p>}
          <ContentBlocks blocks={writing.blocks} />
        </div>
        {writing.link && (
          <p>
            <a href={writing.link} target="_blank" rel="noopener noreferrer">Read the original ↗</a>
          </p>
        )}
      </article>
    </section>
  );
}
