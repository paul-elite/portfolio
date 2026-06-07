'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
  usePreferences,
  type ColorPersonality,
  type FontSizePreference,
  type NavigationStyle,
  type ProjectView,
} from './PreferenceProvider';

const fontSizeSteps: { value: FontSizePreference; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
  { value: 'extra-large', label: 'Extra large' },
];

const themeOptions: {
  value: ColorPersonality;
  label: string;
  description: string;
  swatches: string[];
}[] = [
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Quiet neutrals',
    swatches: ['#171717', '#eeeeee', '#ffffff'],
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Crisp blue accent',
    swatches: ['#15171c', '#2388e8', '#e8f3ff'],
  },
  {
    value: 'expressive',
    label: 'Expressive',
    description: 'Warmer contrast',
    swatches: ['#201a1a', '#e31d1c', '#ffe9e7'],
  },
];

const navigationOptions: {
  value: NavigationStyle;
  label: string;
  icon: 'bars' | 'radial' | 'command';
}[] = [
  { value: 'standard', label: 'Standard', icon: 'bars' },
  { value: 'radial', label: 'Radial', icon: 'radial' },
  { value: 'command', label: 'Command', icon: 'command' },
];

const projectViewOptions: {
  value: ProjectView;
  label: string;
  icon: 'list' | 'grid' | 'cards' | 'timeline';
}[] = [
  { value: 'list', label: 'List', icon: 'list' },
  { value: 'grid', label: 'Grid', icon: 'grid' },
  { value: 'case-study', label: 'Cards', icon: 'cards' },
  { value: 'timeline', label: 'Timeline', icon: 'timeline' },
];

function SettingsLabel({ children }: { children: string }) {
  return (
    <h3 className="home-settings-label text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--experience-muted)]">
      {children}
    </h3>
  );
}

function SettingsIcon({ name }: { name: 'bars' | 'radial' | 'command' | 'list' | 'grid' | 'cards' | 'timeline' }) {
  if (name === 'bars') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
        <path d="M4 5h10M4 9h10M4 13h10" />
      </svg>
    );
  }

  if (name === 'radial') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
        <circle cx="9" cy="9" r="2.2" />
        <circle cx="9" cy="3.5" r="1.3" />
        <circle cx="14" cy="11.5" r="1.3" />
        <circle cx="4" cy="11.5" r="1.3" />
      </svg>
    );
  }

  if (name === 'command') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 6h6M6 12h6M5.5 3.5h7a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" />
      </svg>
    );
  }

  if (name === 'list') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6h9M6 10h9M6 14h9" />
        <path d="M4 6h.01M4 10h.01M4 14h.01" />
      </svg>
    );
  }

  if (name === 'grid') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M4 4h5v5H4zM11 4h5v5h-5zM4 11h5v5H4zM11 11h5v5h-5z" />
      </svg>
    );
  }

  if (name === 'cards') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 6h9v8H5z" />
        <path d="M7 4h9v8" />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M5 4v12M5 6h10M5 10h7M5 14h9" />
      <circle cx="5" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="14" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-2xl bg-[var(--experience-surface)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--experience-accent-soft)]"
      style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
    >
      <span className="text-sm font-medium text-[var(--experience-text)]">{label}</span>
      <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${checked ? 'bg-[var(--experience-accent)]' : 'bg-black/10'}`}>
        <span className={`h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </span>
    </button>
  );
}

export function FontSizeControl() {
  const { preferences, setPreference } = usePreferences();
  const selectedIndex = Math.max(0, fontSizeSteps.findIndex((step) => step.value === preferences.fontSize));
  const selected = fontSizeSteps[selectedIndex];

  return (
    <section className="home-settings-group space-y-3">
      <div className="flex items-center justify-between gap-3">
        <SettingsLabel>Font size</SettingsLabel>
        <span className="rounded-full bg-[var(--experience-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--experience-accent)]">
          {selected.label}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={fontSizeSteps.length - 1}
        step={1}
        value={selectedIndex}
        aria-label="Font size"
        onChange={(event) => setPreference('fontSize', fontSizeSteps[Number(event.target.value)].value)}
        className="w-full accent-[var(--experience-accent)]"
      />
      <div className="flex justify-between text-[0.7rem] text-[var(--experience-muted)]">
        {fontSizeSteps.map((step) => (
          <span key={step.value}>{step.label}</span>
        ))}
      </div>
    </section>
  );
}

export function NavigationControl() {
  const { preferences, setPreference } = usePreferences();

  return (
    <section className="home-settings-group space-y-2">
      <SettingsLabel>Navigation</SettingsLabel>
      <div className="grid grid-cols-3 gap-2">
        {navigationOptions.map((option) => {
          const active = preferences.navigationStyle === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreference('navigationStyle', option.value)}
              className={`grid min-h-[4.25rem] place-items-center gap-1 rounded-2xl px-2 py-2 text-center transition-colors ${
                active
                  ? 'bg-[var(--experience-accent)] text-white'
                  : 'bg-[var(--experience-surface)] text-[var(--experience-text)] hover:bg-[var(--experience-accent-soft)]'
              }`}
              style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
            >
              <SettingsIcon name={option.icon} />
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function AnimationControl() {
  const { preferences, setPreference } = usePreferences();
  const enabled = preferences.motion !== 'reduced';

  return (
    <section className="home-settings-group space-y-2">
      <SettingsLabel>Animations</SettingsLabel>
      <Toggle
        checked={enabled}
        label={enabled ? 'On' : 'Off'}
        onChange={(checked) => setPreference('motion', checked ? 'subtle' : 'reduced')}
      />
    </section>
  );
}

export function ProjectBrowsingControl() {
  const { preferences, setPreference } = usePreferences();

  return (
    <section className="home-settings-group space-y-2">
      <SettingsLabel>Project browsing</SettingsLabel>
      <div className="flex flex-wrap gap-2">
        {projectViewOptions.map((option) => {
          const active = preferences.projectView === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreference('projectView', option.value)}
              className={`flex min-w-[7.4rem] flex-1 items-center gap-2 rounded-2xl px-3 py-3 text-left transition-colors ${
                active
                  ? 'bg-[var(--experience-accent)] text-white'
                  : 'bg-[var(--experience-surface)] text-[var(--experience-text)] hover:bg-[var(--experience-accent-soft)]'
              }`}
              style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
            >
              <span className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full ${active ? 'bg-white/18' : 'bg-[var(--experience-card)]'}`}>
                <SettingsIcon name={option.icon} />
              </span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs leading-5 text-[var(--experience-muted)]">Applies to image-heavy browsing sections.</p>
    </section>
  );
}

export function ThemeControl() {
  const { preferences, setPreference } = usePreferences();

  return (
    <section className="home-settings-group space-y-2">
      <SettingsLabel>Theme</SettingsLabel>
      <div className="grid gap-2">
        {themeOptions.map((option) => {
          const active = preferences.colorPersonality === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreference('colorPersonality', option.value)}
              className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                active
                  ? 'bg-[var(--experience-accent)] text-white'
                  : 'bg-[var(--experience-surface)] text-[var(--experience-text)] hover:bg-[var(--experience-accent-soft)]'
              }`}
              style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
            >
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className={`block text-xs ${active ? 'text-white/75' : 'text-[var(--experience-muted)]'}`}>{option.description}</span>
              </span>
              <span className="flex flex-shrink-0 gap-1">
                {option.swatches.map((swatch) => (
                  <span
                    key={swatch}
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: swatch, boxShadow: '0 0 0 0.5px rgb(0 0 0 / 10%)' }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function SoundControl() {
  const { preferences, setPreference } = usePreferences();
  const enabled = preferences.sound === 'on';

  return (
    <section className="home-settings-group space-y-3">
      <SettingsLabel>Sound</SettingsLabel>
      <Toggle
        checked={enabled}
        label={enabled ? 'On' : 'Off'}
        onChange={(checked) => setPreference('sound', checked ? 'on' : 'off')}
      />
      {enabled && (
        <div className="space-y-2 rounded-2xl bg-[var(--experience-surface)] px-3 py-3" style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}>
          <div className="flex items-center justify-between text-xs font-medium text-[var(--experience-muted)]">
            <span>Volume</span>
            <span>{preferences.soundVolume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={preferences.soundVolume}
            aria-label="Sound volume"
            onChange={(event) => setPreference('soundVolume', Number(event.target.value))}
            className="w-full accent-[var(--experience-accent)]"
          />
        </div>
      )}
    </section>
  );
}

export function CustomizeExperienceContent({ onClose }: { onClose?: () => void }) {
  const { resetPreferences } = usePreferences();

  return (
    <div className="home-settings-panel w-full max-w-[572px] text-[var(--experience-text)]">
      <div className="home-settings-header mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Customize the portfolio</h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="home-settings-close grid h-9 w-9 place-items-center rounded-full bg-[var(--experience-surface)] text-[var(--experience-muted)] hover:text-[var(--experience-text)]"
            aria-label="Close"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-5">
        <FontSizeControl />
        <NavigationControl />
        <AnimationControl />
        <ProjectBrowsingControl />
        <ThemeControl />
        <SoundControl />
      </div>

      <button
        type="button"
        onClick={resetPreferences}
        className="home-settings-reset mt-5 w-full rounded-full bg-[var(--experience-surface)] px-4 py-2.5 text-sm font-medium text-[var(--experience-text)] hover:bg-[var(--experience-accent-soft)]"
      >
        Reset to smart defaults
      </button>
    </div>
  );
}

export default function CustomizeExperiencePanel({
  variant = 'floating',
  className = '',
}: {
  variant?: 'floating' | 'avatar';
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const isAvatarVariant = variant === 'avatar';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`home-settings-trigger ${isAvatarVariant ? 'inline-grid h-10 w-10 place-items-center rounded-full p-0' : 'fixed bottom-4 left-4 z-[9997] inline-flex h-11 items-center gap-2 rounded-full px-3 md:bottom-6 md:left-6'} bg-[var(--experience-card)] text-sm font-medium text-[var(--experience-text)] backdrop-blur transition-colors hover:bg-[var(--experience-surface)] ${className}`}
        style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
        aria-label="Customize experience"
      >
        <span className={`home-settings-trigger-icon ${isAvatarVariant ? 'h-8 w-8' : 'h-7 w-7'} grid place-items-center rounded-full bg-[var(--experience-accent-soft)] text-[var(--experience-accent)]`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </span>
        {!isAvatarVariant && <span className="hidden sm:inline">Customize</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close customize experience"
              className="fixed inset-0 z-[10000] bg-black/10 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Customize experience"
              className="home-settings-popover fixed bottom-4 left-4 right-4 z-[10001] max-h-[82dvh] overflow-y-auto rounded-[28px] bg-[var(--experience-card)] p-5 text-[var(--experience-text)] md:bottom-6 md:left-6 md:right-auto md:w-[25rem]"
              style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              <CustomizeExperienceContent onClose={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
