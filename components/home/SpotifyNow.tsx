'use client';

import { useNowPlaying } from '@/components/NowPlaying';
import s from './benji.module.css';

/* A self-contained now-playing widget for the footer: a spinning album disc
   plus the track and artist. Styled with the page's CSS module (no Tailwind
   dependency), fed by the /api/spotify poll. */
export default function SpotifyNow() {
  const data = useNowPlaying();
  const playing = Boolean(data?.isPlaying);
  const art = playing && data?.albumImageUrl ? data.albumImageUrl : '/music-icon.svg';

  return (
    <div className={s.spw}>
      <span className={`${s.spwDisc} ${playing ? s.spwSpin : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} alt="" />
      </span>
      <div className={s.spwText}>
        {playing ? (
          <>
            <a className={s.spwTitle} href={data?.songUrl} target="_blank" rel="noopener noreferrer">
              {data?.title}
            </a>
            {data?.artist && <span className={s.spwArtist}>{data.artist}</span>}
          </>
        ) : (
          <>
            <span className={s.spwTitle}>Not listening right now</span>
            <span className={s.spwArtist}>
              {data?.lastPlayed?.title ? `last listened to ${data.lastPlayed.title}` : 'check again shortly'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
