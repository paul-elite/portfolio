import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProjectBySlug, getSiteConfig } from '@/lib/content-service';
import ContentBlocks from '@/components/content/ContentBlocks';
import shell from '@/components/home/shell.module.css';

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

  return (
    <section className={shell.pane}>
      <article className={shell.section}>
        <h1 className={shell.sectionTitle}>{project.title}</h1>
        {project.description && <p>{project.description}</p>}

        {cs && (
          <>
            {cs.overview && (<><h2>Overview</h2><p>{cs.overview}</p></>)}
            {cs.challenge && (<><h2>Challenge</h2><p>{cs.challenge}</p></>)}
            {cs.approach && (<><h2>Approach</h2><p>{cs.approach}</p></>)}
            {cs.outcome && (<><h2>Outcome</h2><p>{cs.outcome}</p></>)}
          </>
        )}

        <ContentBlocks blocks={project.blocks} />

        {project.link && (
          <p>
            <a href={project.link} target="_blank" rel="noopener noreferrer">Visit the project ↗</a>
          </p>
        )}
      </article>
    </section>
  );
}
