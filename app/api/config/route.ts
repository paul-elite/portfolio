import { NextResponse } from 'next/server';
import { supabase, Settings, defaultSettings } from '@/lib/supabase';
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
  const dynamicSettings = await loadSettings();

  const config = {
    name: dynamicSettings?.name || staticConfig.name,
    title: dynamicSettings?.title || staticConfig.title,
    avatar: dynamicSettings?.avatar || staticConfig.avatar,
    bio: staticConfig.bio,
    social: {
      twitter: dynamicSettings?.twitter || staticConfig.social.twitter,
      github: dynamicSettings?.github || staticConfig.social.github,
      linkedin: dynamicSettings?.linkedin || staticConfig.social.linkedin,
      email: dynamicSettings?.email || staticConfig.social.email,
    },
  };

  return NextResponse.json(config);
}
