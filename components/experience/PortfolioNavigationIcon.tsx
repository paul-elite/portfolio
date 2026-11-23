'use client';

import type { PortfolioTab } from '@/lib/portfolio-options';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { DashboardSquare01Icon, SparklesIcon, PencilEdit01Icon, Message01Icon, Mic01Icon } from '@hugeicons/core-free-icons';

type FallbackIconName = 'grid' | 'spark' | 'write' | 'chat' | 'mic';

const fallbackIconByTarget: Record<PortfolioTab, FallbackIconName> = {
  projects: 'grid',
  illustration: 'spark',
  writings: 'write',
  interaction: 'chat',
  appearances: 'mic',
};

const fallbackIcons: Record<FallbackIconName, IconSvgElement> = {
  grid: DashboardSquare01Icon,
  spark: SparklesIcon,
  write: PencilEdit01Icon,
  chat: Message01Icon,
  mic: Mic01Icon,
};

function FallbackNavigationIcon({ icon, className }: { icon: FallbackIconName; className?: string }) {
  return <HugeiconsIcon icon={fallbackIcons[icon]} className={className} strokeWidth={1.6} aria-hidden="true" />;
}

export default function PortfolioNavigationIcon({
  target,
  src,
  className = 'h-5 w-5',
  imageFit = 'contain',
}: {
  target: PortfolioTab;
  src?: string;
  className?: string;
  imageFit?: 'contain' | 'cover';
}) {
  if (src) {
    const objectFitClass = imageFit === 'cover' ? 'object-cover' : 'object-contain';
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${className} ${objectFitClass}`} />;
  }

  return <FallbackNavigationIcon icon={fallbackIconByTarget[target]} className={className} />;
}
