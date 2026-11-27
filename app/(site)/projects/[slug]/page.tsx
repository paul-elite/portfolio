import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProjectBySlug, getSiteConfig } from '@/lib/content-service';
import { tocFromBlocks, headingId } from '@/lib/toc';
import ContentBlocks from '@/components/content/ContentBlocks';
import { longDate } from '@/lib/dates';
import ArticleReader from '@/components/home/ArticleReader';
import MyTasks from '@/components/stageshow/mytasks';
import only from '@/components/home/cards/card-only.module.css';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons';

export const revalidate = 60;

const CARD_ONLY = 'search-interfaces';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  const config = await getSiteConfig();
  const name = config.name || 'Paul Elite';
  // A draft (tagged 'draft') can be read by its URL but isn't for search engines yet
  const draft = !!p?.tags?.includes('draft');
  // A project with its own icon shows it in the tab; the rest keep the site's (the portrait)
  const icons = p?.avatar ? { icon: p.avatar, shortcut: p.avatar, apple: p.avatar } : undefined;
  return { title: p ? `${p.title} - ${name}` : name, ...(icons ? { icons } : {}), ...(draft ? { robots: { index: false, follow: false } } : {}) };
}

export default async function ProjectContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  // For now the Designing Search page is only its feature card, nothing else.
  // Its case study stays in the database and comes back by removing this.
  if (slug === CARD_ONLY) {
    return (
      <main className={only.page}>
        <div className={only.card}>
          <MyTasks />
        </div>
      </main>
    );
  }

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

  // a project tagged 'no-back' shows Back as a faded, disabled "Back to Home" (Tabs that stack, the user 2026-11-27)
  return (
    <ArticleReader title={project.title} date={longDate(project.published || project.year)} toc={toc} back={!project.tags?.includes('no-back')} rules={!project.tags?.includes('no-rules')}>
      {/* The description is the project's card line; the article opens on its own text (Figma 140:9911) */}
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
