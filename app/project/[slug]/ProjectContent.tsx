'use client';

import Link from 'next/link';
import { Project, siteConfig } from '@/lib/data';

interface ProjectContentProps {
  project: Project;
}

export default function ProjectContent({ project }: ProjectContentProps) {
  return (
    <main className="min-h-screen bg-white">
      <div className="w-full px-6">
        {/* Back Button */}
        <div className="pt-12 grid grid-cols-12 gap-6">
          <div className="col-span-2" />
          <div className="col-span-1" />
          <div className="col-span-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors -ml-6"
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
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="pt-24 pb-16 grid grid-cols-12 gap-6">
          <div className="col-span-2" />

          {/* Avatar */}
          <div className="col-span-1 flex justify-end items-start">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-sm font-medium text-gray-500">
                {siteConfig.name.charAt(0)}
              </span>
            </div>
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

            {/* Mobile Mockup */}
            <div className="mb-16">
              <div className="relative w-[266px] h-[560px] bg-gray-900 rounded-[48px] p-3 shadow-xl">
                <div className="w-full h-full bg-gray-100 rounded-[38px] overflow-hidden flex items-center justify-center">
                  <span className="text-gray-400 text-sm text-center px-6">
                    {project.title}
                  </span>
                </div>
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-full" />
              </div>
            </div>

            {/* Case Study Content */}
            {project.caseStudy && (
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
          </div>

          <div className="col-span-2" />
        </div>
      </div>
    </main>
  );
}
