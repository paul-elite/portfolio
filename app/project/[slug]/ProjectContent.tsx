'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Project, ContentBlock } from '@/lib/data';

interface ProjectNav {
  slug: string;
  title: string;
}

interface ProjectContentProps {
  project: Project;
  prevProject?: ProjectNav | null;
  nextProject?: ProjectNav | null;
}

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={index} className="text-lg font-semibold text-gray-900 mt-8 mb-4">
          {block.content}
        </h2>
      );
    case 'text':
      return (
        <p key={index} className="text-base text-gray-600 leading-relaxed mb-4">
          {block.content}
        </p>
      );
    case 'image':
      return (
        <div key={index} className="my-6 relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={block.content}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      );
    case 'quote':
      return (
        <blockquote key={index} className="border-l-2 border-gray-200 pl-4 my-6 text-gray-500 italic">
          {block.content}
        </blockquote>
      );
    case 'code':
      return (
        <pre key={index} className="bg-gray-50 rounded-lg p-4 my-6 overflow-x-auto text-sm">
          <code>{block.content}</code>
        </pre>
      );
    case 'svg':
      return (
        <div key={index} className="my-6" dangerouslySetInnerHTML={{ __html: block.content }} />
      );
    default:
      return null;
  }
}

export default function ProjectContent({ project, prevProject, nextProject }: ProjectContentProps) {
  const hasBlocks = project.blocks && project.blocks.length > 0;

  return (
    <main className="min-h-screen bg-white">
      <div className="w-full px-6">
        {/* Main Content */}
        <div className="pt-48 pb-16 grid grid-cols-12 gap-6">
          <div className="col-span-2" />

          {/* Back Button (replaces avatar) */}
          <div className="col-span-1 flex justify-end items-start">
            <Link
              href="/"
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all hover:opacity-80"
              style={{
                background: 'linear-gradient(to bottom, #fefeff, #ffffff)',
                boxShadow: 'inset 0 1px 0.5px rgba(255, 255, 255, 1), 0 0 0 0.5px rgba(0, 0, 0, 0.05)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          </div>

          {/* Content Column */}
          <div className="col-span-6">
            {/* Project Title */}
            <div className="h-14 mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                {project.title}
              </h1>
              <div className="flex gap-4 text-sm text-gray-400">
                {project.year && <span>{project.year}</span>}
                {project.role && <span>{project.role}</span>}
              </div>
            </div>

            {/* Mobile Mockup - only show if preview exists */}
            {project.preview && (
              <div className="mb-16">
                <div className="relative w-[266px] h-[560px] bg-gray-900 rounded-[48px] p-3 shadow-xl">
                  <div className="w-full h-full bg-gray-100 rounded-[38px] overflow-hidden flex items-center justify-center relative">
                    <Image
                      src={project.preview}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-full" />
                </div>
              </div>
            )}

            {/* Block Content - for projects with blocks */}
            {hasBlocks && (
              <div className="prose prose-gray max-w-none">
                {project.blocks!.map((block, index) => renderBlock(block, index))}
              </div>
            )}

            {/* Case Study Content - for projects with caseStudy */}
            {!hasBlocks && project.caseStudy && (
              <div className="space-y-10">
                <section>
                  <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                    Overview
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {project.caseStudy.overview}
                  </p>
                </section>

                <section>
                  <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                    Challenge
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {project.caseStudy.challenge}
                  </p>
                </section>

                <section>
                  <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                    Approach
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {project.caseStudy.approach}
                  </p>
                </section>

                <section>
                  <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                    Outcome
                  </h2>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {project.caseStudy.outcome}
                  </p>
                </section>
              </div>
            )}

            {/* Description fallback if no blocks or caseStudy */}
            {!hasBlocks && !project.caseStudy && project.description && (
              <p className="text-base text-gray-600 leading-relaxed">
                {project.description}
              </p>
            )}

            {/* Link */}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-gray-900 transition-colors mt-12 inline-block"
              >
                View Project →
              </a>
            )}

            {/* Project Navigation */}
            {(prevProject || nextProject) && (
              <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-100">
                {prevProject ? (
                  <Link
                    href={`/project/${prevProject.slug}`}
                    className="group flex flex-col items-start"
                  >
                    <span className="text-xs text-gray-400 mb-1">Previous Project</span>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                      ← {prevProject.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                {nextProject ? (
                  <Link
                    href={`/project/${nextProject.slug}`}
                    className="group flex flex-col items-end"
                  >
                    <span className="text-xs text-gray-400 mb-1">Next Project</span>
                    <span className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                      {nextProject.title} →
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            )}
          </div>

          <div className="col-span-2" />
        </div>
      </div>
    </main>
  );
}
