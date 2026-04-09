import { NextResponse } from 'next/server';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

async function getAccessToken() {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN || '',
    }),
  });

  return response.json();
}

export async function GET() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return NextResponse.json({ isPlaying: false });
  }

  try {
    const tokenResponse = await getAccessToken();

    if (!tokenResponse.access_token) {
      return NextResponse.json({ isPlaying: false });
    }

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${tokenResponse.access_token}`,
      },
    });

    if (response.status === 204 || response.status > 400) {
      // Fetch recently played
      const recentResponse = await fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        if (recentData.items && recentData.items.length > 0) {
          const track = recentData.items[0].track;
          return NextResponse.json({
            isPlaying: false,
            lastPlayed: {
              title: track.name,
              artist: track.artists.map((a: { name: string }) => a.name).join(', '),
            },
          });
        }
      }

      return NextResponse.json({ isPlaying: false });
    }

    const song = await response.json();

    if (!song.item) {
      return NextResponse.json({ isPlaying: false });
    }

    const isPlaying = song.is_playing;
    const progressMs = song.progress_ms;
    const durationMs = song.item.duration_ms;

    // Handle both tracks and podcast episodes
    if (song.currently_playing_type === 'episode') {
      // Podcast episode
      const title = song.item.name;
      const artist = song.item.show?.name || 'Podcast';
      const album = song.item.show?.name || '';
      const albumImageUrl = song.item.images?.[0]?.url || song.item.show?.images?.[0]?.url;
      const songUrl = song.item.external_urls?.spotify;

      return NextResponse.json({
        isPlaying,
        title,
        artist,
        album,
        albumImageUrl,
        songUrl,
        progressMs,
        durationMs,
        type: 'episode',
      });
    }

    // Regular track
    const title = song.item.name;
    const artist = song.item.artists.map((a: { name: string }) => a.name).join(', ');
    const album = song.item.album.name;
    const albumImageUrl = song.item.album.images[0]?.url;
    const songUrl = song.item.external_urls.spotify;

    return NextResponse.json({
      isPlaying,
      title,
      artist,
      album,
      albumImageUrl,
      songUrl,
      progressMs,
      durationMs,
      type: 'track',
    });
  } catch {
    return NextResponse.json({ isPlaying: false });
  }
}
