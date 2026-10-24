import type { PortfolioContent, PortfolioNavigationItem, PortfolioNavTarget, Project } from './content-model';
import { ANIMATED_SCREENS } from './screen-animations';

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

// Derive the individual page label from its image filename, not the parent project.
function screenTitle(src: string, fallback: string): string {
  const filename = decodeURIComponent(src.split('?')[0].split('/').pop() || '')
    .replace(/\\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\\s+/g, ' ').trim();
  return filename && !/^(image|img|screen|screenshot|preview|frame|mockup|\\d+)(\\s*\\d+)?$/i.test(filename)
    ? filename
    : fallback;
}

export function buildReelSections(content: PortfolioContent, navigation: PortfolioNavigationItem[] = []): ReelSection[] {
  const sections: ReelSection[] = [
    {
      id: 'work',
      label: 'Work',
      empty: 'New work is on its way.',
      // A project's other screens follow its main one, each on a phone of its own
      items: [...content.projects].sort((a, b) => {
        const priority = (p: Project) => /rig[\\s-]*intel/i.test(`${p.title} ${p.slug}`) ? 0 : 1;
        return priority(a) - priority(b);
      }).flatMap(p => {
        const item: ReelItem = {
          ...p,
          href: `/project/${p.slug}`,
          cta: 'View case study',
          category: projectCategory(p),
          book: p.tags?.includes('case-study'),
        };
        if (item.book) return [item];
        const extra = (p.previewImages ?? []).filter(src => src && src !== p.preview);
        return [item, ...extra.map((src, k) => ({ ...item, id: `${p.id}-${k + 2}`, slug: `${p.slug}~${k + 2}`, title: screenTitle(src, `Screen ${k + 2}`), preview: src, previewImages: [] }))];
      }),
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
  // Only items with something real to show: a screen of their own, an animated screen, or the book.
  // No placeholder screens. Work always shows; other tabs need items and their navigation switch on.
  return sections
    .map(s => ({ ...s, items: s.items.filter(hasArtwork) }))
    .filter(s => s.id === 'work' || (s.items.length > 0 && navigation.find(n => n.target === TARGETS[s.id])?.enabled !== false));
}

const hasArtwork = (item: ReelItem) =>
  !!item.book || !!item.preview || (item.previewImages?.length ?? 0) > 0 || item.slug in ANIMATED_SCREENS;

export const isExternal = (href: string) => /^https?:\/\//.test(href);
