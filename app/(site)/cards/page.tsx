import Link from 'next/link';
import type { Metadata } from 'next';
import { getPortfolioContent, getSiteConfig } from '@/lib/content-service';
import FeatureCards, { type FeatureCardItem } from '@/components/home/cards/FeatureCards';
import { getFeatured } from '@/lib/featured';
import s from '@/components/home/cards/page.module.css';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return { title: `Featured - ${config.name || 'Paul Elite'}` };
}

// The Featured work as stageshow cards: each item plays a short loop of the kind of
// interface it is about. Same items and order as the home Featured list.
export default async function FeaturedCardsPage() {
  const content = await getPortfolioContent();

  // Same items and order as the home Featured list (pinned first). Each card plays the
  // kind of interface its work is about.
  const items: FeatureCardItem[] = getFeatured(content).map((f) => ({
    key: f.key,
    kind: f.type === 'writing' ? 'chart' : f.screens.length > 1 ? 'phone' : 'search',
    title: f.title,
    cat: f.cat,
    href: f.href,
    external: f.external,
    screens: f.screens,
  }));

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
