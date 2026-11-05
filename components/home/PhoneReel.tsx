'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import styles from '@/app/home.module.css';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

// The phone plays /reel.mp4. It fades in on the first frame, stays paused when
// the visitor prefers reduced motion, and falls back to a quiet "Showreel"
// screen while the file is missing or still loading.
export default function PhoneReel({ label }: { label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [landscape, setLandscape] = useState(false);
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  useEffect(() => {
    if (reduceMotion) videoRef.current?.pause();
  }, [reduceMotion]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <>
      <div className={styles.screenFallback} aria-hidden="true">
        <span>Showreel</span>
      </div>

      {!failed && (
        <video
          ref={videoRef}
          className={`${styles.video} ${ready ? styles.videoReady : ''} ${landscape ? styles.videoContain : ''}`}
          src="/reel.mp4"
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          preload="auto"
          aria-label={label}
          onLoadedData={() => setReady(true)}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            setLandscape(video.videoWidth > video.videoHeight * 1.15);
          }}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      )}

      {ready && !playing && !failed && (
        <button type="button" className={styles.play} onClick={toggle} aria-label="Play showreel">
          <svg viewBox="0 0 12 14" aria-hidden="true">
            <path d="M1.5 1.5 11 7 1.5 12.5Z" />
          </svg>
        </button>
      )}
    </>
  );
}
