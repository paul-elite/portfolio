'use client';

import type { PortfolioTab } from '@/lib/portfolio-options';

type FallbackIconName = 'grid' | 'spark' | 'write' | 'chat';

const fallbackIconByTarget: Record<PortfolioTab, FallbackIconName> = {
  projects: 'grid',
  illustration: 'spark',
  writings: 'write',
  interaction: 'chat',
};

function isSvgImage(src: string) {
  const [path] = src.toLowerCase().split('?');
  return path.endsWith('.svg') || src.startsWith('data:image/svg+xml');
}

function FallbackNavigationIcon({ icon, className }: { icon: FallbackIconName; className?: string }) {
  if (icon === 'grid') {
    return (
      <svg className={className} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
        <path d="M4 4h5v5H4zM13 4h5v5h-5zM4 13h5v5H4zM13 13h5v5h-5z" />
      </svg>
    );
  }

  if (icon === 'spark') {
    return (
      <svg className={className} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z" />
      </svg>
    );
  }

  if (icon === 'write') {
    return (
      <svg className={className} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 17h12" />
        <path d="M6 14l8.6-8.6 2 2L8 16H6z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 6h12v8H8l-3 3z" />
      <path d="M8 9h6M8 12h4" />
    </svg>
  );
}

export default function PortfolioNavigationIcon({
  target,
  src,
  className = 'h-5 w-5',
}: {
  target: PortfolioTab;
  src?: string;
  className?: string;
}) {
  if (src) {
    if (isSvgImage(src)) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt="" className={`${className} object-contain`} />;
    }

    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${className} object-cover`} />;
  }

  return <FallbackNavigationIcon icon={fallbackIconByTarget[target]} className={className} />;
}
