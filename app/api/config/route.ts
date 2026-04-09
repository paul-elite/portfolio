import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { siteConfig as staticConfig } from '@/lib/data';

interface Settings {
  name: string;
  title: string;
  avatar: string;
  twitter: string;
  github: string;
  linkedin: string;
  email: string;
}

async function loadSettings(): Promise<Settings | null> {
  try {
    return await kv.get<Settings>('portfolio:settings');
  } catch {
    return null;
  }
}

export async function GET() {
  // Load settings from Vercel KV
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
