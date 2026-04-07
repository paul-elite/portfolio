import { notFound } from 'next/navigation';
import ProjectCard from '@/components/ProjectCard';
import { getWorkCategory, workCategories } from '@/lib/data';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return workCategories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getWorkCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <>
      <main className="min-h-screen bg-white pt-12 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors mb-8"
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

          {/* Header Section */}
          <section className="pb-8 border-b border-gray-100">
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
              {category.discipline}
            </span>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">
              {category.title}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              {category.description}
            </p>
          </section>

          {/* Projects List */}
          <section className="py-8">
            <div>
              {category.projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
