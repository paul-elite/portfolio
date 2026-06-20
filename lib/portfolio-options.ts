import type { IllustrationCategory, PortfolioNavigationItem, PortfolioNavTarget } from './content-model';

export type PortfolioTab = PortfolioNavTarget;

export const MAIN_PORTFOLIO_TABS: { key: PortfolioTab; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'illustration', label: 'Illustration' },
  { key: 'writings', label: 'Writings' },
];

export const SECONDARY_PORTFOLIO_TABS: { key: PortfolioTab; label: string }[] = [
  { key: 'interaction', label: 'Interaction' },
];

export const DEFAULT_PORTFOLIO_NAVIGATION_ITEMS: PortfolioNavigationItem[] = [
  { id: 'projects', label: 'Projects', target: 'projects', accentColor: '#2388e8', enabled: true, order: 0 },
  { id: 'illustration', label: 'Illustration', target: 'illustration', accentColor: '#f97316', enabled: true, order: 1 },
  { id: 'writings', label: 'Writings', target: 'writings', accentColor: '#8b5cf6', enabled: true, order: 2 },
  { id: 'interaction', label: 'Interaction', target: 'interaction', accentColor: '#16a34a', enabled: true, order: 3 },
];

export const ILLUSTRATION_CATEGORIES: { key: IllustrationCategory; label: string; symbol: string }[] = [
  { key: 'app-icons', label: 'App Icons', symbol: 'phone' },
  { key: 'characters', label: 'Character Illustrations', symbol: 'spark' },
  { key: 'assets', label: 'Assets', symbol: 'frame' },
];

export function isIllustrationCategory(value: string | null): value is IllustrationCategory {
  return ILLUSTRATION_CATEGORIES.some((category) => category.key === value);
}
