import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase, Settings, defaultSettings } from '@/lib/supabase';
import { mapIllustration, mapProject, mapSettings } from '@/lib/content-adapters';
import { withSettingsIconFallbacks } from '@/lib/settings-icon-assets';
import { toAppearance, validateAppearance } from '@/lib/appearances';

// Appearances have their own validation and columns, so they're saved here rather than through the
// generic path below. Every change also refreshes the public pages that list them.
const APPEARANCES_SETUP = 'The appearances table is missing. Run the appearances SQL in supabase-content-schema.sql once.';
const missingTable = (error: { code?: string; message?: string } | null) =>
  !!error && (error.code === '42P01' || error.code === 'PGRST205' || /appearances/.test(error.message || '') && /not find|does not exist/.test(error.message || ''));
const slugify = (s: string) => s.toLowerCase().trim().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'appearance';

function revalidateAppearances() {
  revalidatePath('/');
  revalidatePath('/appearances');
}

async function createAppearance(data: Record<string, unknown>) {
  const checked = validateAppearance(data);
  if (!checked.ok) return NextResponse.json({ error: checked.error, details: checked.error }, { status: 400 });
  const base = slugify(checked.row.title as string);
  // A title can repeat (a second episode on the same show): its address gets a number
  for (let n = 1; n <= 20; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const { data: item, error } = await supabase.from('appearances').insert({ id: crypto.randomUUID(), slug, ...checked.row }).select().single();
    if (!error) { revalidateAppearances(); return NextResponse.json({ success: true, item: toAppearance(item) }); }
    if (missingTable(error)) return NextResponse.json({ error: APPEARANCES_SETUP, details: APPEARANCES_SETUP }, { status: 503 });
    if (error.code !== '23505') {
      console.error('Appearance insert error:', error);
      return NextResponse.json({ error: 'Failed to create', details: error.message }, { status: 500 });
    }
  }
  return NextResponse.json({ error: 'Failed to create', details: 'Too many appearances share this title.' }, { status: 409 });
}

async function updateAppearance(id: string, data: Record<string, unknown>) {
  if (!id) return NextResponse.json({ error: 'Missing id', details: 'Missing id' }, { status: 400 });
  const checked = validateAppearance(data);
  if (!checked.ok) return NextResponse.json({ error: checked.error, details: checked.error }, { status: 400 });
  const { data: item, error } = await supabase.from('appearances')
    .update({ ...checked.row, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) {
    if (missingTable(error)) return NextResponse.json({ error: APPEARANCES_SETUP, details: APPEARANCES_SETUP }, { status: 503 });
    console.error('Appearance update error:', error);
    return NextResponse.json({ error: 'Failed to update', details: error.message }, { status: 500 });
  }
  revalidateAppearances();
  return NextResponse.json({ success: true, item: toAppearance(item) });
}

// No fallback: without ADMIN_PASSWORD configured, every admin request is refused.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function loadSettings(): Promise<Settings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error || !data) {
      return withSettingsIconFallbacks(defaultSettings);
    }
    return withSettingsIconFallbacks(mapSettings(data));
  } catch {
    return withSettingsIconFallbacks(defaultSettings);
  }
}

async function saveSettings(settings: Settings): Promise<Settings> {
  // Convert camelCase to snake_case for database
  const updatedAt = new Date().toISOString();
  const dbSettings: Record<string, unknown> = {
    name: settings.name,
    title: settings.title,
    avatar: settings.avatar,
    avatar_focused: settings.avatarFocused || '',
    settings_icon: settings.settingsIcon || '',
    settings_icon_selected: settings.settingsIconSelected || '',
    settings_icon_deselected: settings.settingsIconDeselected || '',
    navigation_items: settings.navigationItems || [],
    favicon_image: settings.faviconImage || '',
    meta_image: settings.metaImage,
    twitter: settings.twitter,
    github: settings.github,
    linkedin: settings.linkedin,
    email: settings.email,
    behance: settings.behance,
    instagram: settings.instagram,
    twitter_image: settings.twitterImage || '',
    linkedin_image: settings.linkedinImage || '',
    behance_image: settings.behanceImage || '',
    instagram_image: settings.instagramImage || '',
    email_image: settings.emailImage || '',
    updated_at: updatedAt,
  };

  const { data: existing } = await supabase
    .from('settings')
    .select('*')
    .single();
  const existingColumns = existing ? new Set(Object.keys(existing)) : null;
  if (existingColumns && !existingColumns.has('navigation_items') && settings.navigationItems) {
    throw new Error('The settings.navigation_items column is missing. Run the latest Supabase schema migration before saving navigation icons.');
  }
  if (existingColumns && !existingColumns.has('favicon_image') && settings.faviconImage) {
    throw new Error('The settings.favicon_image column is missing. Run the latest Supabase schema migration before saving the favicon.');
  }

  const writableSettings = existingColumns
    ? Object.fromEntries(Object.entries(dbSettings).filter(([key]) => existingColumns.has(key)))
    : dbSettings;

  if (existing) {
    const { data, error } = await supabase
      .from('settings')
      .update(writableSettings)
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error) throw error;
    return mapSettings(data);
  }

  const { data, error } = await supabase
    .from('settings')
    .insert(dbSettings)
    .select('*')
    .single();

  if (error) throw error;
  return mapSettings(data);
}

function checkAuth(request: NextRequest): boolean {
  if (!ADMIN_PASSWORD) return false;
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
    const [settings, projectsRes, writingsRes, illustrationsRes, interactionsRes, appearancesRes] = await Promise.all([
      loadSettings(),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('writings').select('*').order('created_at', { ascending: false }),
      supabase.from('illustrations').select('*'),
      supabase.from('interactions').select('*').order('created_at', { ascending: false }),
      supabase.from('appearances').select('*').order('date', { ascending: false, nullsFirst: true }),
    ]);

    // Log errors for debugging
    if (illustrationsRes.error) {
      console.error('Illustrations fetch error:', illustrationsRes.error);
    }

    return NextResponse.json({
      settings,
      projects: (projectsRes.data || []).map(mapProject),
      writings: writingsRes.data || [],
      illustrations: (illustrationsRes.data || []).map(mapIllustration),
      interactions: interactionsRes.data || [],
      appearances: (appearancesRes.data || []).map(toAppearance),
      // Until the table exists, admin explains how to add it instead of failing to save
      appearancesSetup: missingTable(appearancesRes.error) ? APPEARANCES_SETUP : null,
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

    if (type === 'appearances') return createAppearance(data || {});

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
        avatar: data.avatar || '',
        thumbnail: data.thumbnail || '',
        youtube_url: data.youtubeUrl || data.youtube_url || '',
        category: data.category || 'assets',
      };
    } else if (type === 'interactions') {
      insertData = {
        ...insertData,
        avatar: data.avatar || '',
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
      const savedSettings = await saveSettings(newSettings);
      revalidatePath('/', 'page');
      revalidatePath('/admin', 'page');
      return NextResponse.json({ success: true, settings: savedSettings });
    }

    if (type === 'appearances') return updateAppearance(String(id || ''), data || {});

    if (!['projects', 'illustrations', 'writings', 'interactions'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Transform camelCase to snake_case for database
    const updateData = { ...data };
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
    if (type === 'illustrations') {
      if ('youtubeUrl' in updateData) {
        updateData.youtube_url = updateData.youtubeUrl;
        delete updateData.youtubeUrl;
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
    return NextResponse.json({
      error: 'Failed to update',
      details: error instanceof Error ? error.message : undefined,
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { type, id } = await request.json();

    if (!['projects', 'illustrations', 'writings', 'interactions', 'appearances'].includes(type)) {
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
    if (type === 'appearances') revalidateAppearances();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
