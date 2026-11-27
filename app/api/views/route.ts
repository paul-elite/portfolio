import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

// How many visits an article has had: every analytics_events row logged for its path. Articles
// used to live at /project/<slug>, so those older visits count too.

// Visits brought over from another article, up to a moment: Tabs that stack was made from the Avatars
// article on 27 Nov 2026 and carries the visits Avatars had by then (the user asked to import them). Visits
// to Avatars after that stay its own. Nothing is copied: they are counted from the original rows.
const IMPORTED: Record<string, { paths: string[]; before: string }> = {
  '/projects/tabs-that-stack': { paths: ['/projects/avatars', '/project/avatars'], before: '2026-11-27T05:54:18Z' },
};

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') || '';
  if (!/^\/(projects|writings)\/[\w-]+$/.test(path)) return NextResponse.json({ error: 'Not an article' }, { status: 400 });
  if (!hasSupabaseConfig) return NextResponse.json({ visits: null });
  const paths = path.startsWith('/projects/') ? [path, path.replace('/projects/', '/project/')] : [path];
  const { count, error } = await supabase.from('analytics_events').select('id', { count: 'exact', head: true }).in('path', paths);
  if (error) return NextResponse.json({ visits: null }, { status: 500 });
  let imported = 0;
  const from = IMPORTED[path];
  if (from) {
    const res = await supabase.from('analytics_events').select('id', { count: 'exact', head: true }).in('path', from.paths).lt('created_at', from.before);
    if (res.error) return NextResponse.json({ visits: null }, { status: 500 });
    imported = res.count ?? 0;
  }
  return NextResponse.json({ visits: (count ?? 0) + imported }, { headers: { 'Cache-Control': 'no-store' } });
}
