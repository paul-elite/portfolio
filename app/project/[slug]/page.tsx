import { notFound } from 'next/navigation';
import { getProject, projects, Project } from '@/lib/data';
import { supabase } from '@/lib/supabase';
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

async function getProjectFromDatabase(slug: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      description: data.description,
      preview: data.preview || '',
      link: data.link || '',
      year: data.year || '',
      role: data.role || '',
      tags: data.tags || [],
      caseStudy: data.case_study || undefined,
      blocks: data.blocks || [],
    };
  } catch {
    return null;
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  // First try static project
  let project = getProject(slug);

  // If not found, try database
  if (!project) {
    project = await getProjectFromDatabase(slug) || undefined;
  }

  if (!project) {
    notFound();
  }

  return <ProjectContent project={project} />;
}
