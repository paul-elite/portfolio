import { NextRequest, NextResponse } from 'next/server';
import { supabase, Settings, defaultSettings } from '@/lib/supabase';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function loadSettings(): Promise<Settings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error || !data) {
      return defaultSettings;
    }
    return { ...defaultSettings, ...data };
  } catch {
    return defaultSettings;
  }
}

async function saveSettings(settings: Settings): Promise<void> {
  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .single();

  if (existing) {
    await supabase
      .from('settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('settings')
      .insert({ ...settings, updated_at: new Date().toISOString() });
  }
}

// In-memory store for content (projects, etc.) - can migrate to Supabase later
declare global {
  var contentStore: {
    projects: Array<{
      id: string;
      slug: string;
      title: string;
      description: string;
      year: string;
      role: string;
      preview?: string;
      link?: string;
      caseStudy?: {
        overview: string;
        challenge: string;
        approach: string;
        outcome: string;
      };
    }>;
    illustrations: Array<{
      id: string;
      slug: string;
      title: string;
      description: string;
      thumbnail?: string;
      youtubeUrl?: string;
    }>;
    writings: Array<{
      id: string;
      slug: string;
      title: string;
      description: string;
    }>;
    interactions: Array<{
      id: string;
      slug: string;
      title: string;
      description: string;
    }>;
  };
}

if (!global.contentStore) {
  global.contentStore = {
    projects: [],
    illustrations: [],
    writings: [],
    interactions: [],
  };
}

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const password = authHeader.replace('Bearer ', '');
  return password === ADMIN_PASSWORD;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await loadSettings();
  return NextResponse.json({ ...global.contentStore, settings });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, data } = await request.json();

    if (!['projects', 'illustrations', 'writings', 'interactions'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const newItem = { ...data, id, slug };

    const store = global.contentStore[type as 'projects' | 'illustrations' | 'writings' | 'interactions'];
    store.push(newItem);

    return NextResponse.json({ success: true, item: newItem });
  } catch {
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, id, data } = await request.json();

    // Handle settings update - persist to Supabase
    if (type === 'settings') {
      const currentSettings = await loadSettings();
      const newSettings = { ...currentSettings, ...data };
      await saveSettings(newSettings);
      return NextResponse.json({ success: true, settings: newSettings });
    }

    if (!['projects', 'illustrations', 'writings', 'interactions'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const store = global.contentStore[type as keyof typeof global.contentStore];
    if (Array.isArray(store)) {
      const index = store.findIndex((item: { id: string }) => item.id === id);

      if (index === -1) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      store[index] = { ...store[index], ...data };
      return NextResponse.json({ success: true, item: store[index] });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, id } = await request.json();

    if (!['projects', 'illustrations', 'writings', 'interactions'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const store = global.contentStore[type as keyof typeof global.contentStore] as Array<{ id: string }>;
    const index = store.findIndex((item) => item.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    store.splice(index, 1);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
