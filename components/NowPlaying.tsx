'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

interface SpotifyData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
  progressMs?: number;
  durationMs?: number;
  lastPlayed?: {
    title: string;
    artist: string;
  };
}

export function useNowPlaying() {
  const [data, setData] = useState<SpotifyData | null>(null);

  useEffect(() => {
    async function fetchNowPlaying() {
      try {
        const res = await fetch('/api/spotify', { cache: 'no-store' });
        const json = await res.json();
        setData(json);
      } catch {
        setData({ isPlaying: false });
      }
    }

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 5000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

export function NowPlayingImage({ data }: { data: SpotifyData | null }) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
      <Image
        src="/music-icon.svg"
        alt="Music"
        fill
        className={`object-cover ${data?.isPlaying ? 'animate-spin-slow' : ''}`}
      />
    </div>
  );
}

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function NowPlayingText({ data }: { data: SpotifyData | null }) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const lastFetchTime = useRef<number>(Date.now());

  useEffect(() => {
    if (data?.isPlaying && data.progressMs !== undefined && data.durationMs !== undefined) {
      lastFetchTime.current = Date.now();
      setRemainingMs(data.durationMs - data.progressMs);
    } else {
      setRemainingMs(null);
    }
  }, [data?.progressMs, data?.durationMs, data?.isPlaying]);

  useEffect(() => {
    if (!data?.isPlaying || remainingMs === null) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastFetchTime.current;
      const newRemaining = (data.durationMs || 0) - (data.progressMs || 0) - elapsed;
      setRemainingMs(Math.max(0, newRemaining));
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.isPlaying, data?.progressMs, data?.durationMs, remainingMs]);

  if (data?.isPlaying) {
    return (
      <>
        <div className="flex items-center gap-2">
          <a
            href={data.songUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-900 hover:text-gray-600 transition-colors truncate"
          >
            {data.title}
          </a>
          {remainingMs !== null && (
            <span className="text-sm text-gray-400 flex-shrink-0">
              {formatTime(remainingMs)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 truncate">{data.artist}</p>
      </>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-900">Nothing playing</p>
      {data?.lastPlayed ? (
        <p className="text-sm text-gray-400 truncate">
          {data.lastPlayed.title} · {data.lastPlayed.artist}
        </p>
      ) : (
        <p className="text-sm text-gray-400">No recent tracks</p>
      )}
    </>
  );
}
