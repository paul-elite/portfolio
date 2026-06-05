import 'server-only';

import { supabase, type Settings } from './supabase';

const SETTINGS_ICON_BUCKET = 'uploads';
const SETTINGS_ICON_FOLDERS = {
  current: 'settings/icon',
  deselectedLegacy: 'settings/deselected',
  selectedLegacy: 'settings/selected',
  legacy: 'settings',
};

function cacheBustedUrl(url: string, version?: string) {
  if (!url || !version) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(version)}`;
}

async function getLatestSettingsIcon(folder: string) {
  const { data, error } = await supabase.storage
    .from(SETTINGS_ICON_BUCKET)
    .list(folder, { limit: 100 });

  if (error || !data?.length) return '';

  const latest = data
    .filter((item) => item.name && !item.name.startsWith('.'))
    .sort((a, b) => {
      const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
      const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
      return bTime - aTime || b.name.localeCompare(a.name);
    })[0];

  if (!latest) return '';

  const path = `${folder}/${latest.name}`;
  const { data: urlData } = supabase.storage
    .from(SETTINGS_ICON_BUCKET)
    .getPublicUrl(path);

  return cacheBustedUrl(urlData.publicUrl, latest.updated_at || latest.created_at || latest.name);
}

async function getLegacySettingsIcon() {
  const { data, error } = await supabase.storage
    .from(SETTINGS_ICON_BUCKET)
    .list(SETTINGS_ICON_FOLDERS.legacy, { limit: 100 });

  if (error || !data?.length) return '';

  const latest = data
    .filter((item) => item.name && !item.name.startsWith('.') && item.name.includes('.'))
    .sort((a, b) => {
      const aTime = new Date(a.created_at || a.updated_at || 0).getTime();
      const bTime = new Date(b.created_at || b.updated_at || 0).getTime();
      return bTime - aTime || b.name.localeCompare(a.name);
    })[0];

  if (!latest) return '';

  const path = `${SETTINGS_ICON_FOLDERS.legacy}/${latest.name}`;
  const { data: urlData } = supabase.storage
    .from(SETTINGS_ICON_BUCKET)
    .getPublicUrl(path);

  return cacheBustedUrl(urlData.publicUrl, latest.updated_at || latest.created_at || latest.name);
}

export async function withSettingsIconFallbacks(settings: Settings): Promise<Settings> {
  const [currentIcon, selectedLegacyIcon, deselectedLegacyIcon, sharedLegacyIcon] = await Promise.all([
    settings.settingsIcon ? settings.settingsIcon : getLatestSettingsIcon(SETTINGS_ICON_FOLDERS.current),
    settings.settingsIconSelected ? settings.settingsIconSelected : getLatestSettingsIcon(SETTINGS_ICON_FOLDERS.selectedLegacy),
    settings.settingsIconDeselected ? settings.settingsIconDeselected : getLatestSettingsIcon(SETTINGS_ICON_FOLDERS.deselectedLegacy),
    getLegacySettingsIcon(),
  ]);

  return {
    ...settings,
    settingsIcon: currentIcon || selectedLegacyIcon || deselectedLegacyIcon || sharedLegacyIcon,
    settingsIconSelected: selectedLegacyIcon || currentIcon || sharedLegacyIcon,
    settingsIconDeselected: deselectedLegacyIcon || currentIcon || sharedLegacyIcon,
  };
}
