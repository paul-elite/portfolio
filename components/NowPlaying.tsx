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
  type?: 'track' | 'episode';
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

export function NowPlayingContent({ data }: { data: SpotifyData | null }) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [avgColor, setAvgColor] = useState<string>('rgba(0,0,0,0.15)');
  const [saturatedColor, setSaturatedColor] = useState<string>('#666666');
  const [imageReady, setImageReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Extract average color and most saturated color from album art
  useEffect(() => {
    if (!data?.albumImageUrl) {
      setImageReady(false);
      return;
    }

    setImageReady(false);
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    img.src = data.albumImageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setImageReady(true);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Sample from bottom third of image for average color
      const startY = Math.floor(img.height * 0.7);
      const imageData = ctx.getImageData(0, startY, img.width, img.height - startY);
      const pixels = imageData.data;

      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        r += pixels[i];
        g += pixels[i + 1];
        b += pixels[i + 2];
        count++;
      }

      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);

      setAvgColor(`rgba(${r}, ${g}, ${b}, 0.4)`);

      // Find most saturated color from entire image
      const fullImageData = ctx.getImageData(0, 0, img.width, img.height);
      const fullPixels = fullImageData.data;

      let maxSaturation = 0;
      let mostSaturatedR = 128, mostSaturatedG = 128, mostSaturatedB = 128;

      // Sample every 10th pixel for performance
      for (let i = 0; i < fullPixels.length; i += 40) {
        const pr = fullPixels[i];
        const pg = fullPixels[i + 1];
        const pb = fullPixels[i + 2];

        // Calculate saturation (HSL)
        const max = Math.max(pr, pg, pb);
        const min = Math.min(pr, pg, pb);
        const l = (max + min) / 2;

        let s = 0;
        if (max !== min) {
          s = l > 127
            ? (max - min) / (510 - max - min)
            : (max - min) / (max + min);
        }

        // Prefer colors that are saturated and not too dark or too light
        const lightnessBonus = 1 - Math.abs(l - 127) / 127;
        const effectiveSaturation = s * lightnessBonus;

        if (effectiveSaturation > maxSaturation) {
          maxSaturation = effectiveSaturation;
          mostSaturatedR = pr;
          mostSaturatedG = pg;
          mostSaturatedB = pb;
        }
      }

      setSaturatedColor(`rgb(${mostSaturatedR}, ${mostSaturatedG}, ${mostSaturatedB})`);
      setImageReady(true);
    };

    img.onerror = () => {
      setImageReady(true);
    };
  }, [data?.albumImageUrl]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate offset from center, scaled down for subtle movement
    const offsetX = (e.clientX - centerX) * 0.15;
    const offsetY = (e.clientY - centerY) * 0.15;

    setMousePos({ x: offsetX, y: offsetY });
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Cover art and album name on hover */}
      {isHovered && data?.isPlaying && data.albumImageUrl && imageReady && (
        <div
          className="absolute bottom-full mb-3 flex items-center gap-4 z-10 transition-transform duration-75 ease-out"
          style={{
            left: '-64px',
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          }}
        >
          {/* Album art */}
          <div
            className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0"
            style={{
              boxShadow: `0 4px 16px ${avgColor}, 0 2px 8px rgba(0,0,0,0.1)`,
            }}
          >
            <Image
              src={data.albumImageUrl}
              alt={data.album || 'Cover art'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Album name */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-400">Album</span>
            <span
              className="font-gochi text-[32px] leading-tight max-w-[200px]"
              style={{ color: saturatedColor }}
            >
              {data.album}
            </span>
          </div>
        </div>
      )}

      {/* Now Playing content */}
      <div className="flex items-center py-4">
        <div className="flex-shrink-0" style={{ marginLeft: '-64px', marginRight: '24px' }}>
          <NowPlayingImage data={data} />
        </div>
        <div className="min-w-0">
          {data?.isPlaying ? (
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
          ) : (
            <>
              <p className="text-sm text-gray-900">Elite isn't listening to anything right now</p>
              {data?.lastPlayed ? (
                <p className="text-sm text-gray-400 truncate">
                  last listened to {data.lastPlayed.title}
                </p>
              ) : (
                <p className="text-sm text-gray-400">check again shortly</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Legacy exports for backwards compatibility
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
      <p className="text-sm text-gray-900">Elite isn't listening to anything right now</p>
      {data?.lastPlayed ? (
        <p className="text-sm text-gray-400 truncate">
          last listened to {data.lastPlayed.title}
        </p>
      ) : (
        <p className="text-sm text-gray-400">check again shortly</p>
      )}
    </>
  );
}
