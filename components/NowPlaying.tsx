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
}

export default function NowPlaying() {
  const [data, setData] = useState<SpotifyData | null>(null);

  useEffect(() => {
    async function fetchNowPlaying() {
      try {
        const res = await fetch('/api/spotify');
        const json = await res.json();
        setData(json);
      } catch {
        setData({ isPlaying: false });
      }
    }

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data || !data.isPlaying) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 py-4">
      {data.albumImageUrl && (
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 relative">
          <Image
            src={data.albumImageUrl}
            alt={data.album || 'Album art'}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Now playing
          </span>
        </div>
        <a
          href={data.songUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-gray-900 hover:text-gray-600 transition-colors truncate"
        >
          {data.title}
        </a>
        <p className="text-xs text-gray-400 truncate">{data.artist}</p>
      </div>
    </div>
  );
}
