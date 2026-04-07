import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProject, projects } from '@/lib/data';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white pt-12 pb-16">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-12"
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

        {/* Project Header */}
        <header className="mb-16">
          <h1 className="text-3xl font-semibold text-gray-900 mb-4">
            {project.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-6">
            {project.description}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-400">
            {project.year && <span>{project.year}</span>}
            {project.role && <span>{project.role}</span>}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors"
              >
                View Live
              </a>
            )}
          </div>
        </header>

        {/* Case Study Content */}
        {project.caseStudy && (
          <div className="space-y-12">
            <section>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">
                Overview
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                {project.caseStudy.overview}
              </p>
            </section>

            <section>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">
                Challenge
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                {project.caseStudy.challenge}
              </p>
            </section>

            <section>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">
                Approach
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                {project.caseStudy.approach}
              </p>
            </section>

            <section>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-4">
                Outcome
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                {project.caseStudy.outcome}
              </p>
            </section>
          </div>
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-16">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
