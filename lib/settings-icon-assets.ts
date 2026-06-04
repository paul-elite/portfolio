import 'server-only';

import { supabase, type Settings } from './supabase';

const SETTINGS_ICON_BUCKET = 'uploads';
const SETTINGS_ICON_FOLDERS = {
  deselected: 'settings/deselected',
  selected: 'settings/selected',
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

async function getLegacySettingsIcon(index: number) {
  const { data, error } = await supabase.storage
    .from(SETTINGS_ICON_BUCKET)
    .list(SETTINGS_ICON_FOLDERS.legacy, { limit: 100 });

  if (error || !data?.length) return '';

  const files = data
    .filter((item) => item.name && !item.name.startsWith('.') && item.name.includes('.'))
    .sort((a, b) => {
      const aTime = new Date(a.created_at || a.updated_at || 0).getTime();
      const bTime = new Date(b.created_at || b.updated_at || 0).getTime();
      return aTime - bTime || a.name.localeCompare(b.name);
    });

  const file = files[index];
  if (!file) return '';

  const path = `${SETTINGS_ICON_FOLDERS.legacy}/${file.name}`;
  const { data: urlData } = supabase.storage
    .from(SETTINGS_ICON_BUCKET)
    .getPublicUrl(path);

  return cacheBustedUrl(urlData.publicUrl, file.updated_at || file.created_at || file.name);
}

export async function withSettingsIconFallbacks(settings: Settings): Promise<Settings> {
  const [storedSettingsIcon, storedSettingsIconSelected, legacyDeselected, legacySelected] = await Promise.all([
    settings.settingsIcon ? settings.settingsIcon : getLatestSettingsIcon(SETTINGS_ICON_FOLDERS.deselected),
    settings.settingsIconSelected ? settings.settingsIconSelected : getLatestSettingsIcon(SETTINGS_ICON_FOLDERS.selected),
    getLegacySettingsIcon(0),
    getLegacySettingsIcon(1),
  ]);

  return {
    ...settings,
    settingsIcon: storedSettingsIcon || legacyDeselected,
    settingsIconSelected: storedSettingsIconSelected || legacySelected,
  };
}
