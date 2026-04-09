'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface SpotifyData {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
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

export function NowPlayingText({ data }: { data: SpotifyData | null }) {
  if (data?.isPlaying) {
    return (
      <>
        <a
          href={data.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-base font-medium text-gray-900 hover:text-gray-600 transition-colors truncate"
        >
          {data.title}
        </a>
        <p className="text-sm text-gray-400 truncate">{data.artist}</p>
      </>
    );
  }

  return (
    <>
      <p className="text-base font-medium text-gray-900">Nothing playing</p>
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
