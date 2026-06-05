import { createClient } from '@supabase/supabase-js';

export const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-supabase-service-role-key';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Settings {
  id?: number;
  name: string;
  title: string;
  avatar: string;
  avatarFocused?: string;
  settingsIcon?: string;
  settingsIconSelected?: string;
  settingsIconDeselected?: string;
  metaImage: string;
  twitter: string;
  github: string;
  linkedin: string;
  email: string;
  behance: string;
  instagram: string;
  twitterImage?: string;
  linkedinImage?: string;
  behanceImage?: string;
  instagramImage?: string;
  emailImage?: string;
  updated_at?: string;
}

export const defaultSettings: Settings = {
  name: '',
  title: '',
  avatar: '',
  avatarFocused: '',
  settingsIcon: '',
  settingsIconSelected: '',
  settingsIconDeselected: '',
  metaImage: '',
  twitter: '',
  github: '',
  linkedin: '',
  email: '',
  behance: '',
  instagram: '',
  twitterImage: '',
  linkedinImage: '',
  behanceImage: '',
  instagramImage: '',
  emailImage: '',
};
