import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProjectBySlug, getSiteConfig } from '@/lib/content-service';
import { tocFromBlocks, headingId } from '@/lib/toc';
import ContentBlocks from '@/components/content/ContentBlocks';
import ArticleReader from '@/components/home/ArticleReader';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  const config = await getSiteConfig();
  const name = config.name || 'Paul Elite';
  return { title: p ? `${p.title} - ${name}` : name };
}

export default async function ProjectContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const cs = project.caseStudy;
  const csSections: [string, string | undefined][] = [
    ['Overview', cs?.overview],
    ['Challenge', cs?.challenge],
    ['Approach', cs?.approach],
    ['Outcome', cs?.outcome],
  ];
  const csShown = csSections.filter((s): s is [string, string] => Boolean(s[1]));
  const toc = [
    ...csShown.map(([label]) => ({ id: headingId(label), label })),
    ...tocFromBlocks(project.blocks),
  ];

  return (
    <ArticleReader title={project.title} date={project.year} toc={toc}>
      {project.description && <p>{project.description}</p>}
      {csShown.map(([label, value]) => (
        <div key={label}>
          <h2 id={headingId(label)}>{label}</h2>
          <p>{value}</p>
        </div>
      ))}
      <ContentBlocks blocks={project.blocks} />
      {project.link && (
        <p>
          <a href={project.link} target="_blank" rel="noopener noreferrer">Visit the project <HugeiconsIcon icon={ArrowUpRight01Icon} size={13} strokeWidth={1.8} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} /></a>
        </p>
      )}
    </ArticleReader>
  );
}
