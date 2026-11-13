import type { PortfolioNavigationItem, PortfolioNavTarget, SiteConfig } from './content-model';

/** The admin-managed navigation items that are switched on, in their saved order. */
export function enabledNavigationItems(config: SiteConfig): PortfolioNavigationItem[] {
  return (config.navigationItems ?? [])
    .filter((item) => item.enabled !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function sectionHref(target: PortfolioNavTarget) {
  return `/${target}`;
}
