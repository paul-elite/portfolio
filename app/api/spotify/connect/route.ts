import { NextResponse } from 'next/server';

// Reconnecting the "now playing" card to Spotify (2026-11-27). Visiting /api/spotify/connect sends you to
// Spotify's consent page; Spotify sends you back to /callback, which uses the site's own client secret to
// get a new refresh token and shows it only to you. Spotify expires refresh tokens after 180 days.
export const dynamic = 'force-dynamic';

export async function GET() {
  const id = process.env.SPOTIFY_CLIENT_ID;
  if (!id) return new NextResponse('SPOTIFY_CLIENT_ID is not set on the site.', { status: 500 });
  const state = crypto.randomUUID();
  const url = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
    client_id: id,
    response_type: 'code',
    redirect_uri: 'https://paulelite.com/callback',
    state,
    scope: 'user-read-currently-playing user-read-recently-played user-read-playback-state',
  });
  const res = NextResponse.redirect(url);
  // the state comes back with Spotify's reply; /callback only accepts it from this browser
  res.cookies.set('spotify_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/callback', maxAge: 600 });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
