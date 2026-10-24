import 'server-only';
import { patternSeekingEssay } from './pattern-seeking-essay';

const publishedWritings = [patternSeekingEssay];
const mergeWritings = (writings: Writing[]) => [...publishedWritings, ...writings.filter(w => !publishedWritings.some(p => p.slug === w.slug))];

import { hasSupabaseConfig, supabase } from './supabase';
import {
  illustrations as staticIllustrations,
  interactions as staticInteractions,
  siteConfig as staticConfig,
  writings as staticWritings,
} from './data';
import { mapPortfolioContent, mapProject, mapSettings, mapWriting, settingsToSiteConfig } from './content-adapters';
import type { NavItem, PortfolioContent, Project, SiteConfig, Writing } from './content-model';
import { withSettingsIconFallbacks } from './settings-icon-assets';

export async function getSettings() {
  if (!hasSupabaseConfig) {
    return withSettingsIconFallbacks(mapSettings(null));
  }

  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error || !data) return withSettingsIconFallbacks(mapSettings(null));
    return withSettingsIconFallbacks(mapSettings(data));
  } catch {
    return withSettingsIconFallbacks(mapSettings(null));
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const settings = await getSettings();
    return settingsToSiteConfig(settings);
  } catch {
    return {
      ...staticConfig,
      avatarFocused: '',
      socialImages: {},
    };
  }
}

// Projects only ever come from the database: no sample projects, even when it can't be reached
export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (!hasSupabaseConfig) {
    return {
      projects: [],
      writings: mergeWritings(staticWritings),
      illustrations: staticIllustrations,
      interactions: staticInteractions,
    };
  }

  try {
    const [projectsRes, writingsRes, illustrationsRes, interactionsRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('writings').select('*').order('created_at', { ascending: false }),
      supabase.from('illustrations').select('*').order('created_at', { ascending: false }),
      supabase.from('interactions').select('*').order('created_at', { ascending: false }),
    ]);

    const content = mapPortfolioContent({
      projects: projectsRes.data || [],
      writings: writingsRes.data || [],
      illustrations: illustrationsRes.data || [],
      interactions: interactionsRes.data || [],
    });
    return { ...content, writings: mergeWritings(content.writings) };
  } catch {
    return {
      projects: [],
      writings: mergeWritings(staticWritings),
      illustrations: staticIllustrations,
      interactions: staticInteractions,
    };
  }
}

export async function getHomeData() {
  const [config, content] = await Promise.all([
    getSiteConfig(),
    getPortfolioContent(),
  ]);

  return { config, content };
}

export async function getProjectNavigation(): Promise<NavItem[]> {
  if (!hasSupabaseConfig) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('slug, title')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

export async function getWritingNavigation(): Promise<NavItem[]> {
  if (!hasSupabaseConfig) {
    return mergeWritings(staticWritings).map(({ slug, title }) => ({ slug, title }));
  }

  try {
    const { data, error } = await supabase
      .from('writings')
      .select('slug, title')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return staticWritings.map(({ slug, title }) => ({ slug, title }));
    }

    return data;
  } catch {
    return staticWritings.map(({ slug, title }) => ({ slug, title }));
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!hasSupabaseConfig) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return mapProject(data);
  } catch {
    return null;
  }
}

export async function getWritingBySlug(slug: string): Promise<Writing | null> {
  const published = publishedWritings.find(w => w.slug === slug);
  if (published) return published;
  if (!hasSupabaseConfig) {
    const writing = staticWritings.find((item) => item.slug === slug);
    return writing ? { ...writing, blocks: [] } : null;
  }

  try {
    const { data, error } = await supabase
      .from('writings')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      const writing = staticWritings.find((item) => item.slug === slug);
      return writing ? { ...writing, blocks: [] } : null;
    }

    return mapWriting(data);
  } catch {
    const writing = staticWritings.find((item) => item.slug === slug);
    return writing ? { ...writing, blocks: [] } : null;
  }
}

export function getSiblingItems(items: NavItem[], slug: string) {
  const currentIndex = items.findIndex((item) => item.slug === slug);

  return {
    previous: currentIndex > 0 ? items[currentIndex - 1] : null,
    next: currentIndex >= 0 && currentIndex < items.length - 1 ? items[currentIndex + 1] : null,
  };
}
