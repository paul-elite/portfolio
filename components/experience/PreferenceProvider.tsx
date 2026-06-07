'use client';

import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';

export type FontSizePreference = 'small' | 'default' | 'large' | 'extra-large';
export type ColorPersonality = 'minimal' | 'balanced' | 'expressive' | 'funky' | 'serious';
export type NavigationStyle = 'standard' | 'radial' | 'command';
export type MotionPreference = 'reduced' | 'subtle' | 'playful' | 'full';
export type LayoutDensity = 'compact' | 'comfortable' | 'spacious';
export type ProjectView = 'list' | 'grid' | 'case-study' | 'timeline';
export type PersonalityMode = 'direct' | 'friendly' | 'editorial' | 'playful' | 'studio';
export type SoundPreference = 'off' | 'on';

export interface ExperiencePreferences {
  fontSize: FontSizePreference;
  colorPersonality: ColorPersonality;
  navigationStyle: NavigationStyle;
  motion: MotionPreference;
  density: LayoutDensity;
  projectView: ProjectView;
  personality: PersonalityMode;
  sound: SoundPreference;
}

interface PreferenceContextValue {
  preferences: ExperiencePreferences;
  setPreference: <Key extends keyof ExperiencePreferences>(key: Key, value: ExperiencePreferences[Key]) => void;
  resetPreferences: () => void;
  tokens: CSSProperties;
}

const storageKey = 'portfolio-experience-preferences-v1';

export const defaultPreferences: ExperiencePreferences = {
  fontSize: 'default',
  colorPersonality: 'balanced',
  navigationStyle: 'radial',
  motion: 'subtle',
  density: 'comfortable',
  projectView: 'list',
  personality: 'friendly',
  sound: 'off',
};

const fontTokens: Record<FontSizePreference, CSSProperties> = {
  small: {
    '--experience-body-size': '0.875rem',
    '--experience-caption-size': '0.75rem',
    '--experience-line-height': '1.35rem',
  } as CSSProperties,
  default: {
    '--experience-body-size': '1rem',
    '--experience-caption-size': '0.875rem',
    '--experience-line-height': '1.5rem',
  } as CSSProperties,
  large: {
    '--experience-body-size': '1.125rem',
    '--experience-caption-size': '1rem',
    '--experience-line-height': '1.65rem',
  } as CSSProperties,
  'extra-large': {
    '--experience-body-size': '1.25rem',
    '--experience-caption-size': '1.0625rem',
    '--experience-line-height': '1.8rem',
  } as CSSProperties,
};

const colorTokens: Record<ColorPersonality, CSSProperties> = {
  minimal: {
    '--experience-bg': '#f8f8f7',
    '--experience-surface': '#f3f3f2',
    '--experience-card': '#ffffff',
    '--experience-text': '#171717',
    '--experience-muted': '#9ca3af',
    '--experience-border': 'rgb(0 0 0 / 8%)',
    '--experience-accent': '#525252',
    '--experience-accent-soft': '#eeeeee',
  } as CSSProperties,
  balanced: {
    '--experience-bg': '#f8fafc',
    '--experience-surface': '#f4f6f8',
    '--experience-card': '#ffffff',
    '--experience-text': '#15171c',
    '--experience-muted': '#aeb6c2',
    '--experience-border': 'rgb(0 0 0 / 10%)',
    '--experience-accent': '#2388e8',
    '--experience-accent-soft': '#e8f3ff',
  } as CSSProperties,
  expressive: {
    '--experience-bg': '#fffaf7',
    '--experience-surface': '#f9f2ec',
    '--experience-card': '#ffffff',
    '--experience-text': '#201a1a',
    '--experience-muted': '#a17872',
    '--experience-border': 'rgb(227 29 28 / 14%)',
    '--experience-accent': '#e31d1c',
    '--experience-accent-soft': '#ffe9e7',
  } as CSSProperties,
  funky: {
    '--experience-bg': '#fbfbff',
    '--experience-surface': '#f1edff',
    '--experience-card': '#ffffff',
    '--experience-text': '#181326',
    '--experience-muted': '#8a7aa8',
    '--experience-border': 'rgb(116 33 249 / 16%)',
    '--experience-accent': '#7421f9',
    '--experience-accent-soft': '#efe7ff',
  } as CSSProperties,
  serious: {
    '--experience-bg': '#f6f7f8',
    '--experience-surface': '#eef0f2',
    '--experience-card': '#ffffff',
    '--experience-text': '#111827',
    '--experience-muted': '#6b7280',
    '--experience-border': 'rgb(17 24 39 / 12%)',
    '--experience-accent': '#1f2937',
    '--experience-accent-soft': '#e5e7eb',
  } as CSSProperties,
};

const densityTokens: Record<LayoutDensity, CSSProperties> = {
  compact: {
    '--experience-row-padding': '0.55rem',
    '--experience-gap': '0.75rem',
    '--experience-card-padding': '0.85rem',
  } as CSSProperties,
  comfortable: {
    '--experience-row-padding': '0.75rem',
    '--experience-gap': '1rem',
    '--experience-card-padding': '1rem',
  } as CSSProperties,
  spacious: {
    '--experience-row-padding': '1rem',
    '--experience-gap': '1.35rem',
    '--experience-card-padding': '1.25rem',
  } as CSSProperties,
};

const motionTokens: Record<MotionPreference, CSSProperties> = {
  reduced: { '--experience-motion': '0ms', '--experience-scale': '1' } as CSSProperties,
  subtle: { '--experience-motion': '150ms', '--experience-scale': '1.01' } as CSSProperties,
  playful: { '--experience-motion': '260ms', '--experience-scale': '1.025' } as CSSProperties,
  full: { '--experience-motion': '360ms', '--experience-scale': '1.04' } as CSSProperties,
};

const PreferenceContext = createContext<PreferenceContextValue | null>(null);

function readStoredPreferences() {
  if (typeof window === 'undefined') return defaultPreferences;

  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return defaultPreferences;
    return { ...defaultPreferences, ...JSON.parse(stored) } as ExperiencePreferences;
  } catch {
    return defaultPreferences;
  }
}

export function PreferenceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ExperiencePreferences>(defaultPreferences);
  const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setPreferences(readStoredPreferences());
      setHasLoadedPreferences(true);
    });
  }, []);

  useEffect(() => {
    if (!hasLoadedPreferences) return;

    window.localStorage.setItem(storageKey, JSON.stringify(preferences));
  }, [hasLoadedPreferences, preferences]);

  const tokens = useMemo(() => {
    return {
      ...fontTokens[preferences.fontSize],
      ...colorTokens[preferences.colorPersonality],
      ...densityTokens[preferences.density],
      ...motionTokens[preferences.motion],
    };
  }, [preferences]);

  const value = useMemo<PreferenceContextValue>(() => ({
    preferences,
    tokens,
    setPreference: (key, value) => {
      setPreferences((current) => ({ ...current, [key]: value }));
    },
    resetPreferences: () => setPreferences(defaultPreferences),
  }), [preferences, tokens]);

  return (
    <PreferenceContext.Provider value={value}>
      <div
        className="experience-root min-h-full flex flex-1 flex-col"
        data-color-personality={preferences.colorPersonality}
        data-motion={preferences.motion}
        data-density={preferences.density}
        data-personality={preferences.personality}
        data-sound={preferences.sound}
        style={tokens}
      >
        {children}
      </div>
    </PreferenceContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <PreferenceProvider>{children}</PreferenceProvider>;
}

export function usePreferences() {
  const context = useContext(PreferenceContext);

  if (!context) {
    throw new Error('usePreferences must be used inside PreferenceProvider');
  }

  return context;
}
