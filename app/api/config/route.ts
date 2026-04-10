import { NextResponse } from 'next/server';
import { supabase, Settings } from '@/lib/supabase';
import { siteConfig as staticConfig } from '@/lib/data';

async function loadSettings(): Promise<Settings | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error || !data) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function GET() {
  // Load settings from Supabase
  const dbSettings = await loadSettings();

  // If we have database settings, use them (with static fallbacks only for missing fields)
  if (dbSettings) {
    return NextResponse.json({
      name: dbSettings.name || staticConfig.name,
      title: dbSettings.title || staticConfig.title,
      avatar: dbSettings.avatar || '',
      bio: staticConfig.bio,
      social: {
        twitter: dbSettings.twitter || staticConfig.social.twitter,
        github: dbSettings.github || staticConfig.social.github,
        linkedin: dbSettings.linkedin || staticConfig.social.linkedin,
        email: dbSettings.email || staticConfig.social.email,
      },
    });
  }

  // No database settings, use static config
  return NextResponse.json({
    name: staticConfig.name,
    title: staticConfig.title,
    avatar: staticConfig.avatar,
    bio: staticConfig.bio,
    social: staticConfig.social,
  });
}
