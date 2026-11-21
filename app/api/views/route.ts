import { NextRequest, NextResponse } from 'next/server';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

// How many visits an article has had: every analytics_events row logged for its path. Articles
// used to live at /project/<slug>, so those older visits count too.
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') || '';
  if (!/^\/(projects|writings)\/[\w-]+$/.test(path)) return NextResponse.json({ error: 'Not an article' }, { status: 400 });
  if (!hasSupabaseConfig) return NextResponse.json({ visits: null });
  const paths = path.startsWith('/projects/') ? [path, path.replace('/projects/', '/project/')] : [path];
  const { count, error } = await supabase.from('analytics_events').select('id', { count: 'exact', head: true }).in('path', paths);
  if (error) return NextResponse.json({ visits: null }, { status: 500 });
  return NextResponse.json({ visits: count ?? 0 }, { headers: { 'Cache-Control': 'no-store' } });
}
