'use client';

import { useEffect, useRef } from 'react';
import { useNowPlaying } from '@/components/NowPlaying';
import s from './benji.module.css';

/* A self-contained now-playing widget for the footer: a spinning album disc
   plus the track and artist. Styled with the page's CSS module (no Tailwind
   dependency), fed by the /api/spotify poll. */
export default function SpotifyNow() {
  const data = useNowPlaying();
  const playing = Boolean(data?.isPlaying);
  const art = playing && data?.albumImageUrl ? data.albumImageUrl : '/music-icon.svg';
  const discRef = useRef<HTMLSpanElement>(null);

  // Scrolling turns the disc: down = clockwise, up = anticlockwise. Driven by page scroll,
  // or by wheel/touch movement when the page is too short to scroll. Eases toward the target.
  useEffect(() => {
    const el = discRef.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const DEG_PER_PX = 0.35;
    let target = 0;
    let angle = 0;
    let raf = 0;
    let lastY = window.scrollY;
    let touchY: number | null = null;
    const canScroll = () => document.documentElement.scrollHeight > window.innerHeight + 1;

    const tick = () => {
      angle += (target - angle) * 0.18;
      if (Math.abs(target - angle) < 0.05) angle = target;
      el.style.transform = `rotate(${angle}deg)`;
      raf = angle === target ? 0 : requestAnimationFrame(tick);
    };
    const nudge = (dy: number) => {
      target += dy * DEG_PER_PX;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => {
      const y = window.scrollY;
      nudge(y - lastY);
      lastY = y;
    };
    const onWheel = (e: WheelEvent) => { if (!canScroll()) nudge(e.deltaY); };
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? null; };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (y == null || touchY == null) return;
      if (!canScroll()) nudge(touchY - y);
      touchY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <div className={s.spw}>
      {/* The disc turns; the small Spotify mark at its lower right sits outside it and never does */}
      <span className={s.spwDiscWrap}>
        <span ref={discRef} className={`${s.spwDisc} ${playing ? s.spwSpin : s.spwIdle}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art} alt="" />
        </span>
        <svg className={s.spwMark} viewBox="0 0 24 24" aria-label="Spotify" role="img">
          <circle cx="12" cy="12" r="12" fill="#1ED760" />
          <path fill="#000" d="M17.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14 4.38-1.32 9.78-.66 13.5 1.62.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" />
        </svg>
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
