'use client';

import { useNowPlaying } from '@/components/NowPlaying';
import s from './benji.module.css';

/* A quiet footer now-playing line, in the benji.org register: one small grey
   line, the track linked to Spotify. Falls back gracefully when nothing is
   playing or Spotify isn't configured. */
export default function SpotifyNow() {
  const data = useNowPlaying();

  if (!data) return <span className={s.spotify}>{' '}</span>;

  if (data.isPlaying && data.title) {
    return (
      <span className={s.spotify} suppressHydrationWarning>
        <span className={s.spotifyDot} aria-hidden="true" />
        Listening to{' '}
        <a className={s.link} href={data.songUrl} target="_blank" rel="noopener noreferrer">
          {data.title}
        </a>
        {data.artist ? ` — ${data.artist}` : ''}
      </span>
    );
  }

  if (data.lastPlayed?.title) {
    return (
      <span className={s.spotify} suppressHydrationWarning>
        Last listened to {data.lastPlayed.title}
        {data.lastPlayed.artist ? ` — ${data.lastPlayed.artist}` : ''}
      </span>
    );
  }

  return <span className={s.spotify} suppressHydrationWarning>Not listening right now</span>;
}
