import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Settings {
  id?: number;
  name: string;
  title: string;
  avatar: string;
  metaImage: string;
  twitter: string;
  github: string;
  linkedin: string;
  email: string;
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
  metaImage: '',
  twitter: '',
  github: '',
  linkedin: '',
  email: '',
  twitterImage: '',
  linkedinImage: '',
  behanceImage: '',
  instagramImage: '',
  emailImage: '',
};
