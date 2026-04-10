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
      projects: dbProjects.length > 0 ? dbProjects : staticProjects,
      writings: dbWritings.length > 0 ? dbWritings : staticWritings,
      illustrations: dbIllustrations.length > 0 ? dbIllustrations : staticIllustrations,
      interactions: dbInteractions.length > 0 ? dbInteractions : staticInteractions,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    // Fall back to static content on error
    return NextResponse.json({
      projects: staticProjects,
      writings: staticWritings,
      illustrations: staticIllustrations,
      interactions: staticInteractions,
    });
  }
}
