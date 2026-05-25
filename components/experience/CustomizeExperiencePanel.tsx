'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import {
  usePreferences,
  type ColorPersonality,
  type ExperiencePreferences,
  type FontSizePreference,
  type LayoutDensity,
  type MotionPreference,
  type NavigationStyle,
  type PersonalityMode,
  type ProjectView,
} from './PreferenceProvider';

type PreferenceKey = keyof ExperiencePreferences;

interface Option<Value extends string> {
  value: Value;
  label: string;
  description?: string;
}

const fontSizeOptions: Option<FontSizePreference>[] = [
  { value: 'small', label: 'Small' },
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
  { value: 'extra-large', label: 'Extra Large' },
];

const colorOptions: Option<ColorPersonality>[] = [
  { value: 'minimal', label: 'Minimal', description: 'Quiet, mostly neutral' },
  { value: 'balanced', label: 'Balanced', description: 'Clean with tasteful color' },
  { value: 'expressive', label: 'Expressive', description: 'Saturated and energetic' },
  { value: 'funky', label: 'Funky', description: 'Experimental accents' },
  { value: 'serious', label: 'Serious', description: 'Case-study restraint' },
];

const navigationOptions: Option<NavigationStyle>[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'radial', label: 'Radial' },
  { value: 'command', label: 'Command' },
];

const motionOptions: Option<MotionPreference>[] = [
  { value: 'reduced', label: 'Reduced' },
  { value: 'subtle', label: 'Subtle' },
  { value: 'playful', label: 'Playful' },
  { value: 'full', label: 'Full' },
];

const densityOptions: Option<LayoutDensity>[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

const projectViewOptions: Option<ProjectView>[] = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
  { value: 'case-study', label: 'Case cards' },
  { value: 'timeline', label: 'Timeline' },
];

const personalityOptions: Option<PersonalityMode>[] = [
  { value: 'direct', label: 'Direct' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'playful', label: 'Playful' },
  { value: 'studio', label: 'Studio-like' },
];

function ControlGroup<Value extends ExperiencePreferences[PreferenceKey]>({
  title,
  options,
  value,
  onChange,
  compact = false,
}: {
  title: string;
  options: Option<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  compact?: boolean;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-[var(--experience-muted)]">{title}</h3>
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : ''}`}>
        {options.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-2xl px-3 py-2 text-left transition-colors ${
                active
                  ? 'bg-[var(--experience-accent)] text-white'
                  : 'bg-[var(--experience-surface)] text-[var(--experience-text)] hover:bg-[var(--experience-accent-soft)]'
              }`}
              style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              {option.description && (
                <span className={`block text-xs ${active ? 'text-white/75' : 'text-[var(--experience-muted)]'}`}>
                  {option.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function FontSizeControl() {
  const { preferences, setPreference } = usePreferences();
  return <ControlGroup title="Font size" options={fontSizeOptions} value={preferences.fontSize} onChange={(value) => setPreference('fontSize', value)} compact />;
}

export function ColorPersonalityControl() {
  const { preferences, setPreference } = usePreferences();
  return <ControlGroup title="Visual energy" options={colorOptions} value={preferences.colorPersonality} onChange={(value) => setPreference('colorPersonality', value)} />;
}

export function NavigationStyleControl() {
  const { preferences, setPreference } = usePreferences();
  return <ControlGroup title="Navigation" options={navigationOptions} value={preferences.navigationStyle} onChange={(value) => setPreference('navigationStyle', value)} compact />;
}

export function MotionControl() {
  const { preferences, setPreference } = usePreferences();
  return <ControlGroup title="Motion" options={motionOptions} value={preferences.motion} onChange={(value) => setPreference('motion', value)} compact />;
}

export function LayoutDensityControl() {
  const { preferences, setPreference } = usePreferences();
  return <ControlGroup title="Density" options={densityOptions} value={preferences.density} onChange={(value) => setPreference('density', value)} compact />;
}

export function ProjectViewControl() {
  const { preferences, setPreference } = usePreferences();
  return <ControlGroup title="Project browsing" options={projectViewOptions} value={preferences.projectView} onChange={(value) => setPreference('projectView', value)} compact />;
}

export function PersonalityControl() {
  const { preferences, setPreference } = usePreferences();
  return <ControlGroup title="Tone" options={personalityOptions} value={preferences.personality} onChange={(value) => setPreference('personality', value)} compact />;
}

export function CustomizeExperienceContent({ onClose }: { onClose?: () => void }) {
  const { resetPreferences } = usePreferences();

  return (
    <div className="w-full max-w-[572px] text-[var(--experience-text)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Customize the portfolio</h2>
          <p className="mt-1 text-sm text-[var(--experience-muted)]">Adjust the interface without hiding the work.</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-[var(--experience-surface)] text-[var(--experience-muted)] hover:text-[var(--experience-text)]"
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
        <ColorPersonalityControl />
        <NavigationStyleControl />
        <MotionControl />
        <LayoutDensityControl />
        <ProjectViewControl />
        <PersonalityControl />
      </div>

      <button
        type="button"
        onClick={resetPreferences}
        className="mt-5 w-full rounded-full bg-[var(--experience-surface)] px-4 py-2.5 text-sm font-medium text-[var(--experience-text)] hover:bg-[var(--experience-accent-soft)]"
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
        className={`${isAvatarVariant ? 'inline-grid h-10 w-10 place-items-center rounded-full p-0' : 'fixed bottom-4 left-4 z-[9997] inline-flex h-11 items-center gap-2 rounded-full px-3 md:bottom-6 md:left-6'} bg-[var(--experience-card)] text-sm font-medium text-[var(--experience-text)] backdrop-blur transition-colors hover:bg-[var(--experience-surface)] ${className}`}
        style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
        aria-label="Customize experience"
      >
        <span className={`${isAvatarVariant ? 'h-8 w-8' : 'h-7 w-7'} grid place-items-center rounded-full bg-[var(--experience-accent-soft)] text-[var(--experience-accent)]`}>
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
              className="fixed bottom-4 left-4 right-4 z-[10001] max-h-[82dvh] overflow-y-auto rounded-[28px] bg-[var(--experience-card)] p-5 text-[var(--experience-text)] md:bottom-6 md:left-6 md:right-auto md:w-[25rem]"
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
