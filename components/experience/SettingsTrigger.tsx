'use client';

type SettingsTriggerState = 'selected' | 'deselected';

function SettingsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v3M12 18v3M4.2 7.5l2.6 1.5M17.2 15l2.6 1.5M4.2 16.5l2.6-1.5M17.2 9l2.6-1.5" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

interface SettingsTriggerProps {
  selected: boolean;
  onClick: () => void;
  icon?: string;
  selectedIcon?: string;
}

export default function SettingsTrigger({ selected, onClick, icon, selectedIcon }: SettingsTriggerProps) {
  const state: SettingsTriggerState = selected ? 'selected' : 'deselected';
  const iconSrc = selected ? selectedIcon || icon : icon;

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
        {iconSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={iconSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <SettingsIcon />
        )}
      </span>
    </button>
  );
}
