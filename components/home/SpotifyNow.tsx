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
      <span ref={discRef} className={`${s.spwDisc} ${playing ? s.spwSpin : ''}`}>
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
