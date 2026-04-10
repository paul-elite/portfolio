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

  try {
    const [settings, projectsRes, writingsRes, illustrationsRes, interactionsRes] = await Promise.all([
      loadSettings(),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('writings').select('*').order('created_at', { ascending: false }),
      supabase.from('illustrations').select('*').order('created_at', { ascending: false }),
      supabase.from('interactions').select('*').order('created_at', { ascending: false }),
    ]);

    return NextResponse.json({
      settings,
      projects: projectsRes.data || [],
      writings: writingsRes.data || [],
      illustrations: illustrationsRes.data || [],
      interactions: interactionsRes.data || [],
    });
  } catch (error) {
    console.error('Error loading content:', error);
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
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

    let insertData: Record<string, unknown> = {
      id,
      slug,
      title: data.title,
      description: data.description || '',
    };

    // Handle type-specific fields
    if (type === 'projects') {
      insertData = {
        ...insertData,
        year: data.year || '',
        role: data.role || '',
        preview: data.preview || '',
        link: data.link || '',
        blocks: data.blocks || [],
        case_study: data.caseStudy || null,
      };
    } else if (type === 'writings') {
      insertData = {
        ...insertData,
        blocks: data.blocks || [],
      };
    } else if (type === 'illustrations') {
      insertData = {
        ...insertData,
        thumbnail: data.thumbnail || '',
        youtube_url: data.youtubeUrl || '',
      };
    } else if (type === 'interactions') {
      insertData = {
        ...insertData,
        link: data.link || '',
      };
    }

    const { data: newItem, error } = await supabase
      .from(type)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, id, data } = await request.json();

    // Handle settings update
    if (type === 'settings') {
      const currentSettings = await loadSettings();
      const newSettings = { ...currentSettings, ...data };
      await saveSettings(newSettings);
      return NextResponse.json({ success: true, settings: newSettings });
    }

    if (!['projects', 'illustrations', 'writings', 'interactions'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const { data: updatedItem, error } = await supabase
      .from(type)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('PUT error:', error);
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

    const { error } = await supabase
      .from(type)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
