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

export default function NowPlaying() {
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
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 py-4">
      {/* Album art or music icon */}
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
        {data?.isPlaying && data.albumImageUrl ? (
          <Image
            src={data.albumImageUrl}
            alt={data.album || 'Album art'}
            fill
            className="object-cover animate-spin-slow"
          />
        ) : (
          <Image
            src="/music-icon.svg"
            alt="Music"
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Text content */}
      <div className="min-w-0 flex-1">
        {data?.isPlaying ? (
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
        ) : (
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
        )}
      </div>
    </div>
  );
}
