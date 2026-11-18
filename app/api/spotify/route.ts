import { NextResponse } from 'next/server';

/* Now-playing feed for the site's music widgets.
   Spotify is checked first (it has live progress). When Spotify isn't playing, Last.fm is
   checked: YouTube Music plays reach Last.fm through a scrobbler (Web Scrobbler on desktop,
   Pano Scrobbler on Android), so a Last.fm "now playing" with Spotify idle means YouTube Music.
   Every response carries `source` so the UI can say where the music is coming from. */

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;

const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing?additional_types=track,episode';
const RECENTLY_PLAYED_ENDPOINT = 'https://api.spotify.com/v1/me/player/recently-played?limit=1';

// Last.fm's grey-star placeholder, served when it has no cover for a track.
const LASTFM_PLACEHOLDER = '2a96cbd8b46e442fc41c2b86b821562f';

type Source = 'spotify' | 'youtube-music';

type Track = {
  isPlaying: boolean;
  source: Source;
  title: string;
  artist: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
  progressMs?: number;
  durationMs?: number;
  type?: 'track' | 'episode';
};

type LastPlayed = { title: string; artist: string; source?: Source };

type SpotifyResult = {
  /** What Spotify has loaded right now (playing or paused). */
  current: Track | null;
  /** Spotify's most recent finished play, fetched only when nothing is loaded. */
  lastPlayed: LastPlayed | null;
  status?: 'configuration_missing' | 'authorization_failed' | 'not_playing' | 'spotify_unavailable';
};

type LastfmResult = { nowPlaying: boolean; track: Track } | null;

const sameTrack = (a?: string, b?: string) =>
  Boolean(a && b && a.trim().toLowerCase() === b.trim().toLowerCase());

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

async function getSpotify(): Promise<SpotifyResult> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return { current: null, lastPlayed: null, status: 'configuration_missing' };
  }

  try {
    const tokenResponse = await getAccessToken();

    if (!tokenResponse.access_token) {
      return { current: null, lastPlayed: null, status: 'authorization_failed' };
    }

    const auth = { Authorization: `Bearer ${tokenResponse.access_token}` };
    const response = await fetch(NOW_PLAYING_ENDPOINT, { headers: auth, cache: 'no-store' });

    if (response.status === 401 || response.status === 403) {
      return { current: null, lastPlayed: null, status: 'authorization_failed' };
    }

    if (response.status === 204 || response.status >= 400) {
      const recentResponse = await fetch(RECENTLY_PLAYED_ENDPOINT, { headers: auth, cache: 'no-store' });
      let lastPlayed: LastPlayed | null = null;

      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
        const track = recentData.items?.[0]?.track;
        if (track) {
          lastPlayed = {
            title: track.name,
            artist: track.artists.map((a: { name: string }) => a.name).join(', '),
            source: 'spotify',
          };
        }
      }

      return {
        current: null,
        lastPlayed,
        status: response.status === 204 ? 'not_playing' : 'spotify_unavailable',
      };
    }

    const song = await response.json();

    if (!song.item) {
      return { current: null, lastPlayed: null, status: 'not_playing' };
    }

    const base = {
      isPlaying: Boolean(song.is_playing),
      source: 'spotify' as const,
      progressMs: song.progress_ms,
      durationMs: song.item.duration_ms,
    };

    // Podcast episode
    if (song.currently_playing_type === 'episode') {
      return {
        lastPlayed: null,
        current: {
          ...base,
          title: song.item.name,
          artist: song.item.show?.name || 'Podcast',
          album: song.item.show?.name || '',
          albumImageUrl: song.item.images?.[0]?.url || song.item.show?.images?.[0]?.url,
          songUrl: song.item.external_urls?.spotify,
          type: 'episode',
        },
      };
    }

    // Regular track
    return {
      lastPlayed: null,
      current: {
        ...base,
        title: song.item.name,
        artist: song.item.artists.map((a: { name: string }) => a.name).join(', '),
        album: song.item.album.name,
        albumImageUrl: song.item.album.images[0]?.url,
        songUrl: song.item.external_urls.spotify,
        type: 'track',
      },
    };
  } catch {
    return { current: null, lastPlayed: null, status: 'spotify_unavailable' };
  }
}

async function getLastfm(): Promise<LastfmResult> {
  if (!LASTFM_API_KEY || !LASTFM_USERNAME) return null;

  try {
    const params = new URLSearchParams({
      method: 'user.getrecenttracks',
      user: LASTFM_USERNAME,
      api_key: LASTFM_API_KEY,
      format: 'json',
      limit: '1',
    });
    const response = await fetch(`https://ws.audioscrobbler.com/2.0/?${params}`, { cache: 'no-store' });
    if (!response.ok) return null;

    const data = await response.json();
    const raw = data?.recenttracks?.track;
    const track = Array.isArray(raw) ? raw[0] : raw;
    if (!track?.name) return null;

    const image: string | undefined = track.image?.at?.(-1)?.['#text'];
    const albumImageUrl = image && !image.includes(LASTFM_PLACEHOLDER) ? image : undefined;
    const title: string = track.name;
    const artist: string = track.artist?.['#text'] || track.artist?.name || '';

    return {
      nowPlaying: track['@attr']?.nowplaying === 'true',
      track: {
        isPlaying: true,
        source: 'youtube-music',
        title,
        artist,
        album: track.album?.['#text'] || undefined,
        albumImageUrl,
        // Link the listener straight to the song on YouTube Music.
        songUrl: `https://music.youtube.com/search?q=${encodeURIComponent(`${title} ${artist}`)}`,
        type: 'track',
      },
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const [spotify, lastfm] = await Promise.all([getSpotify(), getLastfm()]);

  // 1. Spotify is actively playing.
  if (spotify.current?.isPlaying) {
    return NextResponse.json(spotify.current);
  }

  // 2. Spotify is idle but Last.fm has something playing: that's YouTube Music.
  //    Spotify's own Last.fm "now playing" flag can linger after a pause, so if the
  //    paused Spotify track is the same song, treat it as Spotify, not YouTube Music.
  if (lastfm?.nowPlaying && !sameTrack(spotify.current?.title, lastfm.track.title)) {
    return NextResponse.json(lastfm.track);
  }

  // 3. Nothing playing. Last.fm sees plays from both services, so its latest track is
  //    the true "last listened to"; Spotify's history tells us whether it came from Spotify.
  const spotifyRecent = spotify.lastPlayed ?? (spotify.current
    ? { title: spotify.current.title, artist: spotify.current.artist, source: 'spotify' as const }
    : null);

  let lastPlayed: LastPlayed | null = spotifyRecent;
  if (lastfm) {
    const { title, artist } = lastfm.track;
    lastPlayed = {
      title,
      artist,
      source: sameTrack(spotifyRecent?.title, title) ? 'spotify' : 'youtube-music',
    };
  }

  if (lastPlayed) {
    return NextResponse.json({ isPlaying: false, lastPlayed });
  }

  return NextResponse.json({ isPlaying: false, status: spotify.status ?? 'not_playing' });
}
