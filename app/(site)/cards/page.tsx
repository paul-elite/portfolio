import Link from 'next/link';
import type { Metadata } from 'next';
import { getPortfolioContent, getSiteConfig } from '@/lib/content-service';
import FeatureCards, { type FeatureCardItem } from '@/components/home/cards/FeatureCards';
import s from '@/components/home/cards/page.module.css';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return { title: `Featured - ${config.name || 'Paul Elite'}` };
}

// Same labels as the home Featured list: Essay (writings), Study / Design (projects).
const CATEGORY_ALIASES: Record<string, string> = {
  'case-study': 'Study',
  'case study': 'Study',
  'lead designer': 'Design',
  designer: 'Design',
  'design & development': 'Design',
};
function formatCategory(raw: string) {
  const c = raw.trim().toLowerCase();
  if (CATEGORY_ALIASES[c]) return CATEGORY_ALIASES[c];
  const last = c.split(/[\s-]+/).pop() || c;
  return last ? last[0].toUpperCase() + last.slice(1) : last;
}

// The Featured work as stageshow cards: each item plays a short loop of the kind of
// interface it is about. Same items and order as the home Featured list.
export default async function FeaturedCardsPage() {
  const content = await getPortfolioContent();

  type Item = FeatureCardItem & { ts: number };
  const projects: Item[] = content.projects
    .filter((p) => p.year)
    .map((p) => {
      const screens = [p.preview, ...(p.previewImages ?? [])].filter((x): x is string => Boolean(x));
      return {
        key: `p-${p.slug}`,
        kind: screens.length > 1 ? 'phone' : 'search',
        title: p.title,
        cat: formatCategory((p.tags && p.tags[0]) || p.role || ''),
        href: p.link || `/projects/${p.slug}`,
        external: !!p.link,
        screens,
        ts: new Date(`${p.year}-01-01T00:00:00Z`).getTime(),
      };
    });
  const writings: Item[] = content.writings
    .filter((w) => w.date)
    .map((w) => ({
      key: `w-${w.slug}`,
      kind: 'chart',
      title: w.title,
      cat: 'Essay',
      href: w.link || `/writings/${w.slug}`,
      external: !!w.link,
      ts: new Date(w.date!).getTime(),
    }));
  const items = [...projects, ...writings].sort((a, b) => b.ts - a.ts);

  return (
    <main className={s.page}>
      <div className={s.col}>
        <header className={s.head}>
          <Link href="/" className={s.back}>
            Back
          </Link>
          <p className={s.label}>Featured</p>
        </header>
        <FeatureCards items={items} />
      </div>
    </main>
  );
}
