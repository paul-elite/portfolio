import { notFound } from 'next/navigation';
import { projects } from '@/lib/data';
import { getProjectBySlug, getProjectNavigation, getSiblingItems } from '@/lib/content-service';
import ProjectContent from './ProjectContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Allow dynamic params for database projects
export const dynamicParams = true;

// Generate static params for known static projects
export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  const [allProjects, project] = await Promise.all([
    getProjectNavigation(),
    getProjectBySlug(slug),
  ]);

  if (!project) {
    notFound();
  }

  const { previous: prevProject, next: nextProject } = getSiblingItems(allProjects, slug);

  return <ProjectContent project={project} prevProject={prevProject} nextProject={nextProject} />;
}
