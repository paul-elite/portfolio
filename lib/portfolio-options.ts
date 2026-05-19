import type { IllustrationCategory } from './content-model';

export type PortfolioTab = 'projects' | 'interaction' | 'illustration' | 'writings';

export const MAIN_PORTFOLIO_TABS: { key: PortfolioTab; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'illustration', label: 'Illustration' },
  { key: 'writings', label: 'Writings' },
];

export const SECONDARY_PORTFOLIO_TABS: { key: PortfolioTab; label: string }[] = [
  { key: 'interaction', label: 'Interaction' },
];

export const ILLUSTRATION_CATEGORIES: { key: IllustrationCategory; label: string; symbol: string }[] = [
  { key: 'app-icons', label: 'App Icons', symbol: 'phone' },
  { key: 'characters', label: 'Character Illustrations', symbol: 'spark' },
  { key: 'assets', label: 'Assets', symbol: 'frame' },
];

export function isIllustrationCategory(value: string | null): value is IllustrationCategory {
  return ILLUSTRATION_CATEGORIES.some((category) => category.key === value);
}
