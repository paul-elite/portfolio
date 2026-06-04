'use client';

type SettingsTriggerState = 'selected' | 'deselected';

function AnimatedSettingsIcon() {
  return (
    <svg
      className="settings-trigger-sliders"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path className="settings-trigger-slider-line settings-trigger-slider-line--top" d="M4 7h16" />
      <path className="settings-trigger-slider-line settings-trigger-slider-line--middle" d="M4 12h16" />
      <path className="settings-trigger-slider-line settings-trigger-slider-line--bottom" d="M4 17h16" />
      <circle className="settings-trigger-slider-knob settings-trigger-slider-knob--top" cx="8" cy="7" r="2.2" fill="currentColor" stroke="none" />
      <circle className="settings-trigger-slider-knob settings-trigger-slider-knob--middle" cx="16" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <circle className="settings-trigger-slider-knob settings-trigger-slider-knob--bottom" cx="11" cy="17" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface SettingsTriggerProps {
  selected: boolean;
  onClick: () => void;
  icon?: string;
  selectedIcon?: string;
}

export default function SettingsTrigger({ selected, onClick }: SettingsTriggerProps) {
  const state: SettingsTriggerState = selected ? 'selected' : 'deselected';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label="Customize experience"
      data-state={state}
      className="home-settings-trigger inline-grid h-10 w-10 place-items-center rounded-full bg-[var(--experience-card)] text-[var(--experience-text)] backdrop-blur transition-colors hover:bg-[var(--experience-surface)]"
      style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
    >
      <span className="home-settings-trigger-icon grid h-8 w-8 place-items-center overflow-hidden rounded-full">
        <AnimatedSettingsIcon />
      </span>
    </button>
  );
}
