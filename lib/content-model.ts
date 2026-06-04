export interface ContentBlock {
  type: 'text' | 'heading' | 'image' | 'svg' | 'code' | 'quote' | 'list';
  content: string;
  meta?: {
    listItems?: string[];
    listBullets?: (string | null)[];
    alt?: string;
    caption?: string;
    language?: string;
    size?: 'small' | 'medium' | 'large' | 'full';
  };
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  avatar?: string;
  preview?: string;
  previewImages?: string[];
  link?: string;
  tags?: string[];
  year?: string;
  role?: string;
  caseStudy?: {
    overview: string;
    challenge: string;
    approach: string;
    outcome: string;
  };
  blocks?: ContentBlock[];
}

export interface Writing {
  id: string;
  slug: string;
  title: string;
  description: string;
  avatar?: string;
  link?: string;
  date?: string;
  cover?: string;
  blocks?: ContentBlock[];
}

export type IllustrationCategory = 'app-icons' | 'characters' | 'assets';

export interface Illustration {
  id: string;
  slug: string;
  title: string;
  description: string;
  avatar?: string;
  thumbnail?: string;
  youtubeUrl?: string;
  category?: IllustrationCategory;
}

export interface Interaction {
  id: string;
  slug: string;
  title: string;
  description: string;
  avatar?: string;
  link?: string;
}

export interface SocialLinks {
  twitter: string;
  github: string;
  linkedin: string;
  email: string;
  behance: string;
  instagram: string;
}

export interface SocialImages {
  twitter?: string;
  linkedin?: string;
  behance?: string;
  instagram?: string;
  email?: string;
}

export interface SiteConfig {
  name: string;
  title: string;
  avatar: string;
  avatarFocused?: string;
  settingsIcon?: string;
  settingsIconSelected?: string;
  bio: string;
  social: SocialLinks;
  socialImages?: SocialImages;
}

export interface PortfolioContent {
  projects: Project[];
  writings: Writing[];
  illustrations: Illustration[];
  interactions: Interaction[];
}

export interface NavItem {
  slug: string;
  title: string;
}
