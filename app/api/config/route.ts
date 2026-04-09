import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { siteConfig as staticConfig } from '@/lib/data';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

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
    const data = await readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function GET() {
  // Load settings from file
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
