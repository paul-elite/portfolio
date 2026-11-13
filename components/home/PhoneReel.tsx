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
// screen while the file is missing or still loading. Clips keep their own sound:
// the reel autoplays muted (browsers require it) and the toggle under the phone
// turns sound on and off.
export default function PhoneReel({ label }: { label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [landscape, setLandscape] = useState(false);
  const [muted, setMuted] = useState(true);
  const reduceMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  // Start the reel once the component mounts. The server-rendered <video> can
  // load before hydration, so its loadeddata/playing events may already have
  // fired; read the element's state directly instead of waiting for them.
  // React also doesn't reliably emit the `muted` attribute, and browsers only
  // autoplay muted video, so set the property explicitly before calling play().
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    if (reduceMotion) {
      video.pause();
    } else {
      // play() resolves at once if the reel is already running, and plays it
      // if autoplay was blocked or never kicked in.
      video.play().then(() => setPlaying(true)).catch(() => {});
    }

    // Catch up on anything that happened before hydration.
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      if (video.error) setFailed(true);
      else if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) setReady(true);
    });
    return () => {
      cancelled = true;
    };
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

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    setMuted(next);
    if (!next && video.paused) video.play().catch(() => {});
  };

  return (
    <div className={styles.reel}>
      <div className={styles.device}>
        <div className={styles.phone}>
      <div className={styles.screenFallback} aria-hidden="true">
        <span>Showreel</span>
      </div>

      {!failed && (
        <video
          ref={videoRef}
          className={`${styles.video} ${ready ? styles.videoReady : ''} ${landscape ? styles.videoContain : ''}`}
          src="/reel.mp4"
          autoPlay={!reduceMotion}
          muted={muted}
          loop
          playsInline
          preload="auto"
          aria-label={label}
          onLoadedData={() => setReady(true)}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            setLandscape(video.videoWidth > video.videoHeight * 1.15);
          }}
          onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
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
        </div>
      </div>

      {!failed && (
        <button
          type="button"
          className={styles.sound}
          onClick={toggleSound}
          aria-pressed={!muted}
          aria-label={muted ? 'Turn showreel sound on' : 'Turn showreel sound off'}
          disabled={!ready}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z" fill="currentColor" />
            {muted ? (
              <path d="m10.5 6 3.5 4m0-4-3.5 4" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            ) : (
              <path d="M10.5 5.6a3.2 3.2 0 0 1 0 4.8M12.3 3.9a5.6 5.6 0 0 1 0 8.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            )}
          </svg>
          <span>{muted ? 'Sound off' : 'Sound on'}</span>
        </button>
      )}
    </div>
  );
}
