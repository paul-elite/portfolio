import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import {
  projects as staticProjects,
  illustrations as staticIllustrations,
  writings as staticWritings,
  interactions as staticInteractions,
} from '@/lib/data';

export async function GET() {
  try {
    const [projectsRes, writingsRes, illustrationsRes, interactionsRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('writings').select('*').order('created_at', { ascending: false }),
      supabase.from('illustrations').select('*').order('created_at', { ascending: false }),
      supabase.from('interactions').select('*').order('created_at', { ascending: false }),
    ]);

    // Combine database content with static content (static as fallback)
    const dbProjects = (projectsRes.data || []).map(p => ({
      ...p,
      caseStudy: p.case_study,
      youtubeUrl: p.youtube_url,
    }));
    const dbWritings = (writingsRes.data || []).map(w => ({
      ...w,
    }));
    const dbIllustrations = (illustrationsRes.data || []).map(i => ({
      ...i,
      youtubeUrl: i.youtube_url,
    }));
    const dbInteractions = (interactionsRes.data || []).map(i => ({
      ...i,
    }));

    return NextResponse.json({
      projects: dbProjects,
      writings: dbWritings,
      illustrations: dbIllustrations,
      interactions: dbInteractions,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    // Only fall back to static content on error (e.g., database connection issue)
    return NextResponse.json({
      projects: staticProjects,
      writings: staticWritings,
      illustrations: staticIllustrations,
      interactions: staticInteractions,
    });
  }
}
