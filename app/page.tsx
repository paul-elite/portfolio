import { supabase } from '@/lib/supabase';
import {
  siteConfig as staticConfig,
  projects as staticProjects,
  writings as staticWritings,
  illustrations as staticIllustrations,
  interactions as staticInteractions,
} from '@/lib/data';
import HomeContent from '@/components/HomeContent';

async function getConfig() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error || !data) {
      return staticConfig;
    }

    return {
      name: data.name || staticConfig.name,
      title: data.title || staticConfig.title,
      avatar: data.avatar || '',
      bio: staticConfig.bio,
      social: {
        twitter: data.twitter || staticConfig.social.twitter,
        github: data.github || staticConfig.social.github,
        linkedin: data.linkedin || staticConfig.social.linkedin,
        email: data.email || staticConfig.social.email,
        behance: data.behance || staticConfig.social.behance,
        instagram: data.instagram || staticConfig.social.instagram,
      },
    };
  } catch {
    return staticConfig;
  }
}

async function getContent() {
  try {
    const [projectsRes, writingsRes, illustrationsRes, interactionsRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('writings').select('*').order('created_at', { ascending: false }),
      supabase.from('illustrations').select('*').order('created_at', { ascending: false }),
      supabase.from('interactions').select('*').order('created_at', { ascending: false }),
    ]);

    const projects = (projectsRes.data || []).map(p => ({
      ...p,
      caseStudy: p.case_study,
    }));
    const writings = writingsRes.data || [];
    const illustrations = (illustrationsRes.data || []).map(i => ({
      ...i,
      youtubeUrl: i.youtube_url,
    }));
    const interactions = interactionsRes.data || [];

    return {
      projects,
      writings,
      illustrations,
      interactions,
    };
  } catch {
    // Only fall back to static content on error (e.g., database connection issue)
    return {
      projects: staticProjects,
      writings: staticWritings,
      illustrations: staticIllustrations,
      interactions: staticInteractions,
    };
  }
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const [config, content] = await Promise.all([
    getConfig(),
    getContent(),
  ]);

  return (
    <main className="h-screen bg-white overflow-hidden">
      <div className="w-full h-full px-6">
        <HomeContent initialConfig={config} initialContent={content} />
      </div>
    </main>
  );
}
