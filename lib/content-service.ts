import 'server-only';

import { supabase } from './supabase';
import {
  illustrations as staticIllustrations,
  interactions as staticInteractions,
  projects as staticProjects,
  siteConfig as staticConfig,
  writings as staticWritings,
} from './data';
import { mapPortfolioContent, mapProject, mapSettings, mapWriting, settingsToSiteConfig } from './content-adapters';
import type { NavItem, PortfolioContent, Project, SiteConfig, Writing } from './content-model';

export async function getSettings() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error || !data) return mapSettings(null);
    return mapSettings(data);
  } catch {
    return mapSettings(null);
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

export async function getPortfolioContent(): Promise<PortfolioContent> {
  try {
    const [projectsRes, writingsRes, illustrationsRes, interactionsRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('writings').select('*').order('created_at', { ascending: false }),
      supabase.from('illustrations').select('*').order('created_at', { ascending: false }),
      supabase.from('interactions').select('*').order('created_at', { ascending: false }),
    ]);

    return mapPortfolioContent({
      projects: projectsRes.data || [],
      writings: writingsRes.data || [],
      illustrations: illustrationsRes.data || [],
      interactions: interactionsRes.data || [],
    });
  } catch {
    return {
      projects: staticProjects,
      writings: staticWritings,
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
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('slug, title')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return staticProjects.map(({ slug, title }) => ({ slug, title }));
    }

    return data;
  } catch {
    return staticProjects.map(({ slug, title }) => ({ slug, title }));
  }
}

export async function getWritingNavigation(): Promise<NavItem[]> {
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
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return staticProjects.find((project) => project.slug === slug) || null;
    return mapProject(data);
  } catch {
    return staticProjects.find((project) => project.slug === slug) || null;
  }
}

export async function getWritingBySlug(slug: string): Promise<Writing | null> {
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
