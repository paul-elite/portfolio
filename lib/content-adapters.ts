import { siteConfig as staticConfig } from './data';
import { defaultSettings, Settings } from './supabase';
import type { Illustration, Interaction, PortfolioContent, Project, SiteConfig, Writing } from './content-model';

type RecordLike = Record<string, unknown>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? value as T[] : fallback;
}

export function mapProject(row: RecordLike): Project {
  return {
    ...(row as unknown as Project),
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    description: asString(row.description),
    preview: asString(row.preview),
    link: asString(row.link),
    year: asString(row.year),
    role: asString(row.role),
    avatar: asString(row.avatar),
    tags: asArray<string>(row.tags),
    blocks: asArray(row.blocks),
    caseStudy: (row.case_study || row.caseStudy || undefined) as Project['caseStudy'],
    previewImages: asArray<string>(row.preview_images || row.previewImages),
  };
}

export function mapWriting(row: RecordLike): Writing {
  return {
    ...(row as unknown as Writing),
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    description: asString(row.description),
    avatar: asString(row.avatar),
    link: asString(row.link),
    date: asString(row.date),
    cover: asString(row.cover),
    blocks: asArray(row.blocks),
  };
}

export function mapIllustration(row: RecordLike): Illustration {
  return {
    ...(row as unknown as Illustration),
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    description: asString(row.description),
    thumbnail: asString(row.thumbnail),
    youtubeUrl: asString(row.youtube_url || row.youtubeUrl),
    category: (row.category || 'assets') as Illustration['category'],
  };
}

export function mapInteraction(row: RecordLike): Interaction {
  return {
    ...(row as unknown as Interaction),
    id: asString(row.id),
    slug: asString(row.slug),
    title: asString(row.title),
    description: asString(row.description),
    link: asString(row.link),
  };
}

export function mapSettings(row?: Partial<Settings> & RecordLike | null): Settings {
  if (!row) return defaultSettings;

  return {
    ...defaultSettings,
    ...(row as Settings),
    avatarFocused: asString(row.avatar_focused || row.avatarFocused),
    metaImage: asString(row.meta_image || row.metaImage),
    twitterImage: asString(row.twitter_image || row.twitterImage),
    linkedinImage: asString(row.linkedin_image || row.linkedinImage),
    behanceImage: asString(row.behance_image || row.behanceImage),
    instagramImage: asString(row.instagram_image || row.instagramImage),
    emailImage: asString(row.email_image || row.emailImage),
  };
}

export function settingsToSiteConfig(settings?: Partial<Settings> | null): SiteConfig {
  const normalized = mapSettings(settings as (Partial<Settings> & RecordLike) | null);

  return {
    name: normalized.name || staticConfig.name,
    title: normalized.title || staticConfig.title,
    avatar: normalized.avatar || staticConfig.avatar,
    avatarFocused: normalized.avatarFocused || '',
    bio: staticConfig.bio,
    social: {
      twitter: normalized.twitter || staticConfig.social.twitter,
      github: normalized.github || staticConfig.social.github,
      linkedin: normalized.linkedin || staticConfig.social.linkedin,
      email: normalized.email || staticConfig.social.email,
      behance: normalized.behance || staticConfig.social.behance,
      instagram: normalized.instagram || staticConfig.social.instagram,
    },
    socialImages: {
      twitter: normalized.twitterImage || '',
      linkedin: normalized.linkedinImage || '',
      behance: normalized.behanceImage || '',
      instagram: normalized.instagramImage || '',
      email: normalized.emailImage || '',
    },
  };
}

export function mapPortfolioContent(rows: {
  projects?: RecordLike[] | null;
  writings?: RecordLike[] | null;
  illustrations?: RecordLike[] | null;
  interactions?: RecordLike[] | null;
}): PortfolioContent {
  return {
    projects: (rows.projects || []).map(mapProject),
    writings: (rows.writings || []).map(mapWriting),
    illustrations: (rows.illustrations || []).map(mapIllustration),
    interactions: (rows.interactions || []).map(mapInteraction),
  };
}
