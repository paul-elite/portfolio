import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { PortfolioContent, PortfolioNavTarget } from '@/lib/content-model';
import { getHomeData, getSiteConfig } from '@/lib/content-service';
import { enabledNavigationItems } from '@/lib/site-navigation';
import { ILLUSTRATION_CATEGORIES } from '@/lib/portfolio-options';
import SectionBrowser, { type BrowserItem } from './SectionBrowser';

export async function sectionMetadata(target: PortfolioNavTarget): Promise<Metadata> {
  const config = await getSiteConfig();
  const item = enabledNavigationItems(config).find((i) => i.target === target);
  const name = config.name || 'Paul Elite';
  return { title: item ? `${item.label} - ${name}` : name };
}

function formatDate(value?: string) {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function props(entries: [string, string | undefined][]) {
  return entries.filter((e): e is [string, string] => !!e[1]).map(([label, value]) => ({ label, value }));
}

function itemsFor(target: PortfolioNavTarget, content: PortfolioContent): BrowserItem[] {
  switch (target) {
    case 'projects':
      return content.projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        meta: p.year,
        image: p.avatar || p.preview || p.previewImages?.[0],
        href: p.link,
        hrefLabel: 'Visit project',
        properties: props([['Year', p.year], ['Role', p.role], ['Tags', p.tags?.join(', ')]]),
      }));
    case 'writings': {
      const sorted = [...content.writings].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
      return sorted.map((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        meta: w.date ? String(new Date(w.date).getUTCFullYear()) : undefined,
        subtitle: formatDate(w.date),
        image: w.cover || w.avatar,
        href: w.link,
        hrefLabel: 'Read',
        properties: props([['Published', formatDate(w.date)]]),
      }));
    }
    case 'interaction':
      return content.interactions.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        image: i.avatar,
        href: i.link,
        hrefLabel: 'Open',
        properties: [],
      }));
    case 'illustration':
      return content.illustrations
        .filter((i) => i.thumbnail)
        .map((i) => ({
          id: i.id,
          title: i.title,
          description: i.description,
          image: i.thumbnail,
          href: i.youtubeUrl,
          hrefLabel: 'Watch animation',
          properties: props([['Category', ILLUSTRATION_CATEGORIES.find((c) => c.key === i.category)?.label]]),
        }));
  }
}

// One page per menu item, rendered inside the (site) layout's shell. A section switched off in
// admin returns a 404.
export default async function SectionPage({ target }: { target: PortfolioNavTarget }) {
  const { config, content } = await getHomeData();
  const item = enabledNavigationItems(config).find((i) => i.target === target);
  if (!item) notFound();

  return (
    <SectionBrowser
      title={item.label}
      layout={target === 'illustration' ? 'grid' : target === 'writings' ? 'books' : 'list'}
      items={itemsFor(target, content)}
    />
  );
}
