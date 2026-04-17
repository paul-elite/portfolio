import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
    // Convert snake_case from database to camelCase for frontend
    return {
      ...defaultSettings,
      ...data,
      avatarFocused: data.avatar_focused || '',
      metaImage: data.meta_image || data.metaImage || '',
      twitterImage: data.twitter_image || '',
      linkedinImage: data.linkedin_image || '',
      behanceImage: data.behance_image || '',
      instagramImage: data.instagram_image || '',
      emailImage: data.email_image || '',
    };
  } catch {
    return defaultSettings;
  }
}

async function saveSettings(settings: Settings): Promise<void> {
  // Convert camelCase to snake_case for database
  const dbSettings: Record<string, unknown> = {
    name: settings.name,
    title: settings.title,
    avatar: settings.avatar,
    avatar_focused: settings.avatarFocused || '',
    meta_image: settings.metaImage,
    twitter: settings.twitter,
    github: settings.github,
    linkedin: settings.linkedin,
    email: settings.email,
    twitter_image: settings.twitterImage || '',
    linkedin_image: settings.linkedinImage || '',
    behance_image: settings.behanceImage || '',
    instagram_image: settings.instagramImage || '',
    email_image: settings.emailImage || '',
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .single();

  if (existing) {
    await supabase
      .from('settings')
      .update(dbSettings)
      .eq('id', existing.id);
  } else {
    await supabase
      .from('settings')
      .insert(dbSettings);
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
      supabase.from('illustrations').select('*'),
      supabase.from('interactions').select('*').order('created_at', { ascending: false }),
    ]);

    // Log errors for debugging
    if (illustrationsRes.error) {
      console.error('Illustrations fetch error:', illustrationsRes.error);
    }

    // Transform illustrations to camelCase for frontend
    const illustrations = (illustrationsRes.data || []).map((item: Record<string, unknown>) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail,
      youtubeUrl: item.youtube_url,
      category: item.category || 'assets',
    }));

    // Transform projects to camelCase for frontend
    const projects = (projectsRes.data || []).map((item: Record<string, unknown>) => ({
      ...item,
      caseStudy: item.case_study,
      previewImages: item.preview_images,
    }));

    return NextResponse.json({
      settings,
      projects,
      writings: writingsRes.data || [],
      illustrations,
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
        preview_images: data.previewImages || [],
        link: data.link || '',
        blocks: data.blocks || [],
        case_study: data.caseStudy || null,
        avatar: data.avatar || '',
      };
    } else if (type === 'writings') {
      insertData = {
        ...insertData,
        blocks: data.blocks || [],
        cover: data.cover || '',
        date: data.date || new Date().toISOString(),
        avatar: data.avatar || '',
      };
    } else if (type === 'illustrations') {
      insertData = {
        ...insertData,
        thumbnail: data.thumbnail || '',
        youtube_url: data.youtubeUrl || '',
        category: data.category || 'assets',
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

    // Revalidate frontend cache
    revalidatePath('/');
    if (type === 'projects') {
      revalidatePath('/project/[slug]', 'page');
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
      revalidatePath('/');
      return NextResponse.json({ success: true, settings: newSettings });
    }

    if (!['projects', 'illustrations', 'writings', 'interactions'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Transform camelCase to snake_case for database
    let updateData = { ...data };
    if (type === 'projects') {
      if ('caseStudy' in updateData) {
        updateData.case_study = updateData.caseStudy;
        delete updateData.caseStudy;
      }
      if ('previewImages' in updateData) {
        updateData.preview_images = updateData.previewImages;
        delete updateData.previewImages;
      }
    }

    const { data: updatedItem, error } = await supabase
      .from(type)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      console.error('Update data was:', JSON.stringify(updateData, null, 2));
      return NextResponse.json({ error: 'Failed to update', details: error.message }, { status: 500 });
    }

    // Revalidate frontend cache
    revalidatePath('/');
    if (type === 'projects') {
      revalidatePath('/project/[slug]', 'page');
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

    // Revalidate frontend cache
    revalidatePath('/');
    if (type === 'projects') {
      revalidatePath('/project/[slug]', 'page');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
