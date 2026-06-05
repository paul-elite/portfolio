'use client';

type SettingsTriggerState = 'selected' | 'deselected';

interface SettingsTriggerProps {
  selected: boolean;
  onClick: () => void;
  selectedIconSrc?: string;
  deselectedIconSrc?: string;
}

export default function SettingsTrigger({
  selected,
  onClick,
  selectedIconSrc = '/settings-icon-selected.svg',
  deselectedIconSrc = '/settings-icon-deselected.svg',
}: SettingsTriggerProps) {
  const state: SettingsTriggerState = selected ? 'selected' : 'deselected';
  const visibleIconSrc = selected ? selectedIconSrc : deselectedIconSrc;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label="Customize experience"
      data-state={state}
      className="h-10 w-10 overflow-hidden rounded-full p-0"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={visibleIconSrc}
        alt=""
        className="block h-full w-full object-cover"
        aria-hidden="true"
      />
    </button>
  );
}
