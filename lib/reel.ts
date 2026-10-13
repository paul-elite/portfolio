import type { PortfolioContent, PortfolioNavigationItem, PortfolioNavTarget, Project } from './content-model';

// The home reel's sections (the tabs on the Work line) and the items each one shows. Everything
// becomes a project-shaped item, so the reel, zoom and mockups treat all four the same way.

export type ReelSectionId = 'work' | 'writing' | 'illustration' | 'interaction';

export interface ReelItem extends Project {
  /** Where the item leads: its own page, or an outside link */
  href: string;
  /** The link text in the zoomed view */
  cta: string;
  /** Shown at the end of the item's line on the home page */
  category: string;
  /** Show as a book (the title on its cover) instead of a device */
  book?: boolean;
}

export interface ReelSection { id: ReelSectionId; label: string; items: ReelItem[]; empty: string }

// Which settings navigation item turns each section on or off
const TARGETS: Record<ReelSectionId, PortfolioNavTarget> = {
  work: 'projects', writing: 'writings', illustration: 'illustration', interaction: 'interaction',
};

// A project's category: its first tag, else "Case study" for tagged case studies, else its role
function projectCategory(p: Project): string {
  const tag = p.tags?.find(t => t !== 'case-study');
  if (tag) return tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ');
  if (p.tags?.includes('case-study')) return 'Case study';
  return p.role || '';
}

export function buildReelSections(content: PortfolioContent, navigation: PortfolioNavigationItem[] = []): ReelSection[] {
  const sections: ReelSection[] = [
    {
      id: 'work',
      label: 'Work',
      empty: 'New work is on its way.',
      items: content.projects.map(p => ({
        ...p,
        href: `/project/${p.slug}`,
        cta: 'View case study',
        category: projectCategory(p),
        book: p.tags?.includes('case-study'),
      })),
    },
    {
      id: 'writing',
      label: 'Writing',
      empty: 'Writing is on its way.',
      items: content.writings.map(w => ({
        id: w.id, slug: w.slug, title: w.title, description: w.description,
        preview: w.cover || undefined, avatar: w.avatar, year: w.date, role: 'Essay',
        href: w.link || `/writing/${w.slug}`,
        cta: 'Read the essay',
        category: 'Essay',
        book: true,
      })),
    },
    {
      id: 'illustration',
      label: 'Illustration',
      empty: 'Illustrations are on their way.',
      items: content.illustrations.map(il => ({
        id: il.id, slug: il.slug, title: il.title, description: il.description,
        preview: il.thumbnail || undefined, avatar: il.avatar, role: 'Illustration',
        href: il.youtubeUrl || '/explore?view=illustration',
        cta: il.youtubeUrl ? 'Watch the timelapse' : 'See all illustrations',
        category: il.youtubeUrl ? 'Timelapse' : 'Illustration',
      })),
    },
    {
      id: 'interaction',
      label: 'Interaction',
      empty: 'Interactions are on their way.',
      items: content.interactions.map(x => ({
        id: x.id, slug: x.slug, title: x.title, description: x.description,
        preview: x.avatar || undefined, role: 'Interaction',
        href: x.link || '/explore?view=interaction',
        cta: x.link ? 'Try it' : 'See all interactions',
        category: 'Interaction',
      })),
    },
  ];
  // Work always shows; the others follow the settings' navigation switches
  return sections.filter(s => s.id === 'work' || navigation.find(n => n.target === TARGETS[s.id])?.enabled !== false);
}

export const isExternal = (href: string) => /^https?:\/\//.test(href);
