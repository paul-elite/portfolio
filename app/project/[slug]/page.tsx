import { notFound } from 'next/navigation';
import { getProject, projects, Project } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import ProjectContent from './ProjectContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface ProjectNav {
  slug: string;
  title: string;
}

// Allow dynamic params for database projects
export const dynamicParams = true;

// Generate static params for known static projects
export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

async function getAllProjects(): Promise<{ slug: string; title: string }[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('slug, title')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return projects.map(p => ({ slug: p.slug, title: p.title }));
    }

    return data;
  } catch {
    return projects.map(p => ({ slug: p.slug, title: p.title }));
  }
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

  // Get all projects for navigation
  const allProjects = await getAllProjects();

  // First try database (has latest data with blocks)
  let project = await getProjectFromDatabase(slug);

  // Fall back to static project if not in database
  if (!project) {
    project = getProject(slug) || null;
  }

  if (!project) {
    notFound();
  }

  // Find current project index and determine prev/next
  const currentIndex = allProjects.findIndex(p => p.slug === slug);
  const prevProject: ProjectNav | null = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject: ProjectNav | null = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  return <ProjectContent project={project} prevProject={prevProject} nextProject={nextProject} />;
}
