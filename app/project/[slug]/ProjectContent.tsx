'use client';

import Link from 'next/link';
import TableOfContents from '@/components/content/TableOfContents';
import { tocFromBlocks } from '@/lib/toc';
import ContentBlocks from '@/components/content/ContentBlocks';
import DetailPageTransition from '@/components/experience/DetailPageTransition';
import type { NavItem, Project } from '@/lib/content-model';

interface ProjectContentProps {
  project: Project;
  prevProject?: NavItem | null;
  nextProject?: NavItem | null;
}

const CASE_STUDY: { key: keyof NonNullable<Project['caseStudy']>; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'challenge', label: 'Challenge' },
  { key: 'approach', label: 'Approach' },
  { key: 'outcome', label: 'Outcome' },
];

export default function ProjectContent({ project, prevProject, nextProject }: ProjectContentProps) {
  const hasBlocks = !!project.blocks?.length;
  const isCaseStudy = !!project.tags?.includes('case-study');
  const toc = isCaseStudy ? tocFromBlocks(project.blocks) : [];
  const tags = (project.tags ?? []).filter((t) => t !== 'case-study').map((t) => t.replace(/-/g, ' '));
  const facts = [
    project.year && { label: 'Timeline', value: project.year },
    project.role && { label: 'Role', value: project.role },
    tags.length > 0 && { label: 'Focus', value: tags.join(', ') },
    project.link && { label: 'URL', value: <a href={project.link} target="_blank" rel="noopener noreferrer" className="underline decoration-zinc-100 decoration-2 underline-offset-2 hover:decoration-zinc-300">{project.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a> },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];
  const screens = [project.preview, ...(project.previewImages ?? [])].filter((s, i, all): s is string => !!s && all.indexOf(s) === i);

  return (
    <DetailPageTransition>
      <main className="min-h-dvh flex-1 bg-white text-[15px] leading-[1.5] text-black">
        {toc.length > 1 && (
          <div className="fixed top-24 left-10 hidden w-56 xl:block"><TableOfContents items={toc} /></div>
        )}
        <article className="mx-auto w-full max-w-2xl px-8 py-24">
          <Link href="/" data-detail-transition className="mb-8 inline-flex items-center gap-1 text-zinc-400 transition-[color] duration-150 hover:text-zinc-600">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 3L5 8l5 5" /></svg>
            Back
          </Link>

          <h1 className="font-medium text-balance">{project.title}</h1>
          {[project.year, project.role].filter(Boolean).length > 0 && <p className="text-zinc-400">{[project.year, project.role].filter(Boolean).join(' · ')}</p>}
          {project.description && <p className="mt-1 text-pretty text-zinc-500">{project.description}</p>}

          {facts.length > 0 && (
            <dl className="mt-8 border-t border-zinc-100">
              {facts.map((f) => (
                <div key={f.label} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-zinc-100 py-2.5">
                  <dt className="font-medium">{f.label}</dt>
                  <dd className="capitalize-first min-w-0 break-words">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-12">
            {hasBlocks ? (
              <ContentBlocks blocks={project.blocks} variant={isCaseStudy ? 'essay' : 'default'} />
            ) : project.caseStudy ? (
              <div className="flex flex-col gap-8">
                {CASE_STUDY.filter((s) => project.caseStudy?.[s.key]).map((s) => (
                  <section key={s.key} className="flex flex-col gap-2">
                    <h2 className="font-medium">{s.label}</h2>
                    <p className="text-pretty">{project.caseStudy![s.key]}</p>
                  </section>
                ))}
              </div>
            ) : null}
          </div>

          {screens.length > 0 && !hasBlocks && (
            <div className="mt-12 grid gap-6 md:-mx-28 md:grid-cols-2">
              {screens.map((src, i) => (
                <img key={src} src={src} alt={`${project.title}, screen ${i + 1}`} loading={i ? 'lazy' : 'eager'} className="w-full bg-zinc-50 object-cover outline outline-1 -outline-offset-1 outline-black/10" />
              ))}
            </div>
          )}

          {(prevProject || nextProject) && (
            <nav className="mt-20 flex justify-between gap-6 border-t border-zinc-100 pt-6" aria-label="More work">
              {prevProject ? (
                <Link href={`/project/${prevProject.slug}`} data-detail-transition className="group flex min-w-0 flex-col">
                  <span className="text-zinc-400">Previous</span>
                  <span className="truncate underline decoration-zinc-100 decoration-2 underline-offset-2 group-hover:decoration-zinc-300">{prevProject.title}</span>
                </Link>
              ) : <span />}
              {nextProject ? (
                <Link href={`/project/${nextProject.slug}`} data-detail-transition className="group flex min-w-0 flex-col items-end text-right">
                  <span className="text-zinc-400">Next</span>
                  <span className="truncate underline decoration-zinc-100 decoration-2 underline-offset-2 group-hover:decoration-zinc-300">{nextProject.title}</span>
                </Link>
              ) : <span />}
            </nav>
          )}
        </article>
      </main>
    </DetailPageTransition>
  );
}
