import type { PortfolioContent } from '@/lib/content-model';

// The Featured list, shared by the home page and /cards: every project with a year and
// every writing with a date, newest first, except pinned items, which lead in this order.
const PINNED = ['p-search-interfaces'];

export type FeaturedItem = {
  key: string;
  type: 'project' | 'writing';
  slug: string;
  title: string;
  cat: string;
  href: string;
  external: boolean;
  ts: number;
  screens: string[];
};

// The category label: Essay (writings), Study / Design (projects).
const CATEGORY_ALIASES: Record<string, string> = {
  'case-study': 'Study',
  'case study': 'Study',
  'lead designer': 'Design',
  designer: 'Design',
  'design & development': 'Design',
};
export function formatCategory(raw: string) {
  const c = raw.trim().toLowerCase();
  if (CATEGORY_ALIASES[c]) return CATEGORY_ALIASES[c];
  const last = c.split(/[\s-]+/).pop() || c;
  return last ? last[0].toUpperCase() + last.slice(1) : last;
}

export function getFeatured(content: PortfolioContent): FeaturedItem[] {
  const projects: FeaturedItem[] = content.projects
    .filter((p) => p.year)
    .map((p) => ({
      key: `p-${p.slug}`,
      type: 'project',
      slug: p.slug,
      title: p.title,
      cat: formatCategory((p.tags && p.tags[0]) || p.role || ''),
      href: p.link || `/projects/${p.slug}`,
      external: !!p.link,
      ts: new Date(`${p.year}-01-01T00:00:00Z`).getTime(),
      screens: [p.preview, ...(p.previewImages ?? [])].filter((x): x is string => Boolean(x)),
    }));
  const writings: FeaturedItem[] = content.writings
    .filter((w) => w.date)
    .map((w) => ({
      key: `w-${w.slug}`,
      type: 'writing',
      slug: w.slug,
      title: w.title,
      cat: 'Essay',
      href: w.link || `/writings/${w.slug}`,
      external: !!w.link,
      ts: new Date(w.date!).getTime(),
      screens: [],
    }));
  const rank = (k: string) => {
    const i = PINNED.indexOf(k);
    return i < 0 ? PINNED.length : i;
  };
  return [...projects, ...writings].sort((a, b) => rank(a.key) - rank(b.key) || b.ts - a.ts);
}

// The "New" badge marks the most recent item by date, not the pinned one.
export function newestKey(items: FeaturedItem[]) {
  return [...items].sort((a, b) => b.ts - a.ts)[0]?.key;
}
