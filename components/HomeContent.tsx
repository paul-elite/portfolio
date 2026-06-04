'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import OptimizedImage from './OptimizedImage';
import ContentBlocks from './content/ContentBlocks';
import type { Illustration, IllustrationCategory, Interaction, PortfolioContent, Project, SiteConfig, Writing } from '@/lib/content-model';
import {
  ILLUSTRATION_CATEGORIES,
  MAIN_PORTFOLIO_TABS,
  SECONDARY_PORTFOLIO_TABS,
  type PortfolioTab,
} from '@/lib/portfolio-options';
import { useNowPlaying, NowPlayingContent, NowPlayingImage } from './NowPlaying';
import CustomScrollbar from './CustomScrollbar';
import RadialToolkit, { type RadialToolkitItem } from './RadialToolkit';
import { usePreferences } from './experience/PreferenceProvider';
import PortfolioNavigation from './experience/PortfolioNavigation';
import ProjectBrowser from './experience/ProjectBrowsers';
import { CustomizeExperienceContent } from './experience/CustomizeExperiencePanel';
import SettingsTrigger from './experience/SettingsTrigger';
import {
  DesktopAvatarRail,
  PROJECT_LIST_CONTENT_CLASS,
  PortfolioDesktopGrid,
  PortfolioDetailColumn,
  PortfolioHomeFrame,
  PortfolioSidebar,
} from './experience/PortfolioLayout';

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

function isSvgImage(src: string) {
  const [path] = src.toLowerCase().split('?');
  return path.endsWith('.svg') || src.startsWith('data:image/svg+xml');
}

function AvatarImage({
  src,
  alt,
  width,
  height,
  className,
  unoptimized = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
  unoptimized?: boolean;
}) {
  if (isSvgImage(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized={unoptimized}
    />
  );
}

const contactCardBorderStyle = {
  boxShadow: '0 0 0 0.5px rgb(0 0 0 / 10%)',
};

type ContactIconName = 'twitter' | 'github' | 'linkedin' | 'behance' | 'instagram' | 'email';

const radialTabMeta: Record<PortfolioTab, { shortcut: string; icon: 'grid' | 'spark' | 'write' | 'chat' }> = {
  projects: { shortcut: 'P', icon: 'grid' },
  illustration: { shortcut: 'I', icon: 'spark' },
  writings: { shortcut: 'W', icon: 'write' },
  interaction: { shortcut: 'N', icon: 'chat' },
};

function RadialTabIcon({ icon }: { icon: 'grid' | 'spark' | 'write' | 'chat' }) {
  if (icon === 'grid') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M4 4h5v5H4zM13 4h5v5h-5zM4 13h5v5H4zM13 13h5v5h-5z" />
      </svg>
    );
  }

  if (icon === 'spark') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 3l1.8 5.2L18 10l-5.2 1.8L11 17l-1.8-5.2L4 10l5.2-1.8z" />
      </svg>
    );
  }

  if (icon === 'write') {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17h12" />
        <path d="M6 14l8.6-8.6 2 2L8 16H6z" />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6h12v8H8l-3 3z" />
      <path d="M8 9h6M8 12h4" />
    </svg>
  );
}

function ContactIcon({ name }: { name: ContactIconName }) {
  const iconClassName = name === 'email' ? 'h-4 w-4 text-white' : 'h-4 w-4 text-gray-700';

  if (name === 'twitter') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l16 16" />
        <path d="M20 4L4 20" />
      </svg>
    );
  }

  if (name === 'github') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-4 1.5-4-2-5-2.5" />
        <path d="M15 22v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.1-1.5 6.1-6.7a5.2 5.2 0 0 0-1.4-3.6 4.8 4.8 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.4 0C6.2.3 5.1.6 5.1.6A4.8 4.8 0 0 0 5 4.2a5.2 5.2 0 0 0-1.4 3.6c0 5.2 3.1 6.4 6.1 6.7a3.4 3.4 0 0 0-.9 2.6V22" />
      </svg>
    );
  }

  if (name === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v6h-4v-6a2 2 0 0 0-4 0v6h-4v-12h4v1.4A4.9 4.9 0 0 1 16 8z" />
        <path d="M2 9h4v11H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    );
  }

  if (name === 'behance') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h6.2c2 0 3.2 1.1 3.2 2.8 0 1.1-.6 2-1.6 2.4 1.4.4 2.2 1.4 2.2 2.8 0 1.9-1.4 3.1-3.7 3.1H3z" />
        <path d="M3 11.2h6" />
        <path d="M16 8.5h5" />
        <path d="M15.3 14h6.5c0-2.2-1.2-3.7-3.2-3.7-2.1 0-3.5 1.6-3.5 3.6 0 2.2 1.4 3.8 3.8 3.8 1.2 0 2.1-.3 2.8-1" />
      </svg>
    );
  }

  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClassName} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h16v12H4z" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

interface HomeContentProps {
  initialConfig: SiteConfig;
  initialContent: PortfolioContent;
}

export default function HomeContent({ initialConfig, initialContent }: HomeContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { preferences } = usePreferences();
  const [activeTab, setActiveTab] = useState<PortfolioTab>('projects');
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedWriting, setSelectedWriting] = useState<Writing | null>(null);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<IllustrationCategory | null>(null);
  const [activeVideo, setActiveVideo] = useState<Illustration | null>(null);
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [radialPinned, setRadialPinned] = useState(false);
  const [radialAnchor, setRadialAnchor] = useState<{ x: number; y: number } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactHovered, setContactHovered] = useState(false);
  const [showSettingsDetail, setShowSettingsDetail] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [contentAnimationKey, setContentAnimationKey] = useState<string | null>(null);
  const avatarContainerRef = useRef<HTMLDivElement>(null);
  const contentListRef = useRef<HTMLDivElement>(null);
  const radialTriggerRef = useRef<HTMLButtonElement>(null);
  const radialCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [contentListReady, setContentListReady] = useState(false);
  const nowPlayingData = useNowPlaying();

  const siteConfig = initialConfig;
  const content = initialContent;
  const avatar = siteConfig.avatar;
  const avatarFocused = siteConfig.avatarFocused || '';

  // Callback ref handler for contentListRef that triggers state update
  const handleContentListRef = useCallback((el: HTMLDivElement | null) => {
    (contentListRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    setContentListReady(!!el);
  }, []);

  // Preload both avatar images on mount to prevent delay when switching.
  useEffect(() => {
    if (avatar) {
      const img1 = new window.Image();
      img1.src = avatar;
    }
    if (avatarFocused) {
      const img2 = new window.Image();
      img2.src = avatarFocused;
    }
  }, [avatar, avatarFocused]);

  useEffect(() => {
    return () => {
      if (radialCloseTimerRef.current) {
        clearTimeout(radialCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const projectSlug = searchParams.get('project');
    const writingSlug = searchParams.get('writing');
    const interactionSlug = searchParams.get('interaction');
    const category = searchParams.get('category') as IllustrationCategory | null;

    if (projectSlug) {
      const project = content.projects.find((item) => item.slug === projectSlug) || null;
      setActiveTab('projects');
      setSelectedProject(project);
      setSelectedWriting(null);
      setSelectedInteraction(null);
      setSelectedCategory(null);
      setShowSettingsDetail(false);
      setContentAnimationKey(project ? `project-${project.id}-url` : null);
      return;
    }

    if (writingSlug) {
      const writing = content.writings.find((item) => item.slug === writingSlug) || null;
      setActiveTab('writings');
      setSelectedWriting(writing);
      setSelectedProject(null);
      setSelectedInteraction(null);
      setSelectedCategory(null);
      setShowSettingsDetail(false);
      setContentAnimationKey(writing ? `writing-${writing.id}-url` : null);
      return;
    }

    if (interactionSlug) {
      const interaction = content.interactions.find((item) => item.slug === interactionSlug) || null;
      setActiveTab('interaction');
      setSelectedInteraction(interaction);
      setSelectedProject(null);
      setSelectedWriting(null);
      setSelectedCategory(null);
      setShowSettingsDetail(false);
      setContentAnimationKey(interaction ? `interaction-${interaction.id}-url` : null);
      return;
    }

    if (category && ILLUSTRATION_CATEGORIES.some((item) => item.key === category)) {
      setActiveTab('illustration');
      setSelectedCategory(category);
      setSelectedProject(null);
      setSelectedWriting(null);
      setSelectedInteraction(null);
      setShowSettingsDetail(false);
      setContentAnimationKey(`category-${category}-url`);
    }
  }, [content.interactions, content.projects, content.writings, searchParams]);

  // Update URL when selection changes
  const updateURL = useCallback((selection: {
    projectSlug?: string | null;
    writingSlug?: string | null;
    interactionSlug?: string | null;
    category?: IllustrationCategory | null;
  }) => {
    const params = new URLSearchParams();
    if (selection.projectSlug) {
      params.set('project', selection.projectSlug);
    } else if (selection.writingSlug) {
      params.set('writing', selection.writingSlug);
    } else if (selection.interactionSlug) {
      params.set('interaction', selection.interactionSlug);
    } else if (selection.category) {
      params.set('category', selection.category);
    }
    const newURL = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Wrapper functions to update selection and URL together
  const handleSelectProject = useCallback((project: Project | null) => {
    setShowSettingsDetail(false);
    setSelectedProject(project);
    setSelectedWriting(null);
    setSelectedInteraction(null);
    setSelectedCategory(null);
    setPreviewImageIndex(0);
    setContentAnimationKey(project ? `project-${project.id}-${Date.now()}` : null);
    updateURL({ projectSlug: project?.slug || null });
  }, [updateURL]);

  const handleSelectWriting = useCallback((writing: Writing | null) => {
    setShowSettingsDetail(false);
    setSelectedWriting(writing);
    setSelectedProject(null);
    setSelectedInteraction(null);
    setSelectedCategory(null);
    setHoveredProject(null);
    setPreviewImageIndex(0);
    setContentAnimationKey(writing ? `writing-${writing.id}-${Date.now()}` : null);
    updateURL({ writingSlug: writing?.slug || null });
  }, [updateURL]);

  const handleSelectInteraction = useCallback((interaction: Interaction | null) => {
    setShowSettingsDetail(false);
    setSelectedInteraction(interaction);
    setSelectedProject(null);
    setSelectedWriting(null);
    setSelectedCategory(null);
    setHoveredProject(null);
    setPreviewImageIndex(0);
    setContentAnimationKey(interaction ? `interaction-${interaction.id}-${Date.now()}` : null);
    updateURL({ interactionSlug: interaction?.slug || null });
  }, [updateURL]);

  const handleSelectCategory = useCallback((category: IllustrationCategory | null) => {
    setShowSettingsDetail(false);
    setSelectedCategory(category);
    setSelectedProject(null);
    setSelectedWriting(null);
    setSelectedInteraction(null);
    setContentAnimationKey(category ? `category-${category}-${Date.now()}` : null);
    updateURL({ category });
  }, [updateURL]);

  const handleClearSelection = useCallback(() => {
    setShowSettingsDetail(false);
    setSelectedProject(null);
    setSelectedWriting(null);
    setSelectedInteraction(null);
    setSelectedCategory(null);
    setContentAnimationKey(null);
    updateURL({});
  }, [updateURL]);

  const handleTabChange = useCallback((tab: PortfolioTab) => {
    setShowSettingsDetail(false);
    setActiveTab(tab);
    setSelectedProject(null);
    setSelectedWriting(null);
    setSelectedInteraction(null);
    setSelectedCategory(null);
    setHoveredProject(null);
    setShowMoreTabs(false);
    setRadialPinned(false);
    setPreviewImageIndex(0);
    setContentAnimationKey(null);
    updateURL({});
  }, [updateURL]);

  const openSettings = useCallback(() => {
    setSelectedProject(null);
    setSelectedWriting(null);
    setSelectedInteraction(null);
    setSelectedCategory(null);
    setHoveredProject(null);
    setShowMoreTabs(false);
    setRadialPinned(false);
    setPreviewImageIndex(0);
    setContentAnimationKey(`settings-${Date.now()}`);
    setShowSettingsDetail(true);
    updateURL({});
  }, [updateURL]);

  const positionRadialAtTrigger = useCallback(() => {
    const rect = radialTriggerRef.current?.getBoundingClientRect();

    if (rect) {
      setRadialAnchor({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  }, []);

  const isDesktopHoverPointer = useCallback(() => {
    return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);

  const clearRadialCloseTimer = useCallback(() => {
    if (radialCloseTimerRef.current) {
      clearTimeout(radialCloseTimerRef.current);
      radialCloseTimerRef.current = null;
    }
  }, []);

  const closeRadialMenu = useCallback(() => {
    clearRadialCloseTimer();
    setRadialPinned(false);
    setShowMoreTabs(false);
  }, [clearRadialCloseTimer]);

  const scheduleRadialClose = useCallback(() => {
    if (!isDesktopHoverPointer() || radialPinned) return;

    clearRadialCloseTimer();
    radialCloseTimerRef.current = setTimeout(() => {
      setShowMoreTabs(false);
      setRadialPinned(false);
    }, 420);
  }, [clearRadialCloseTimer, isDesktopHoverPointer, radialPinned]);

  const handleRadialHoverStart = useCallback(() => {
    if (!isDesktopHoverPointer() || preferences.navigationStyle !== 'radial') return;

    clearRadialCloseTimer();
    setRadialPinned(false);
    positionRadialAtTrigger();
    setShowMoreTabs(true);
  }, [clearRadialCloseTimer, isDesktopHoverPointer, positionRadialAtTrigger, preferences.navigationStyle]);

  const handleRadialTrigger = useCallback(() => {
    clearRadialCloseTimer();
    positionRadialAtTrigger();

    setShowMoreTabs((open) => {
      const nextOpen = !open;
      setRadialPinned(nextOpen);
      return nextOpen;
    });
  }, [clearRadialCloseTimer, positionRadialAtTrigger]);

  // Get preview images from the hovered project
  const projectImages = useMemo(() => {
    if (!hoveredProject) return [];
    if (hoveredProject.previewImages && hoveredProject.previewImages.length > 0) {
      return hoveredProject.previewImages;
    }
    if (hoveredProject.blocks) {
      return hoveredProject.blocks
        .filter((block) => block.type === 'image')
        .map((block) => block.content);
    }
    return [];
  }, [hoveredProject]);

  // Cycle through project images when hovering (not when selected)
  useEffect(() => {
    if (selectedProject || !hoveredProject || projectImages.length <= 1) return;

    const interval = setInterval(() => {
      setPreviewImageIndex((prev) => (prev + 1) % projectImages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [hoveredProject, projectImages.length, selectedProject]);

  // Sync scroll between content list and avatar column
  useEffect(() => {
    const contentList = contentListRef.current;
    const avatarContainer = avatarContainerRef.current;

    if (!contentList || !avatarContainer) return;

    const handleScroll = () => {
      avatarContainer.scrollTop = contentList.scrollTop;
    };

    contentList.addEventListener('scroll', handleScroll);
    return () => contentList.removeEventListener('scroll', handleScroll);
  }, [contentListReady]);

  const mainTabs = MAIN_PORTFOLIO_TABS;

  // Track if anything is selected to fade other elements
  const hasSelection = selectedProject !== null || selectedWriting !== null || selectedInteraction !== null || selectedCategory !== null;
  const hasDetailContent = hasSelection || showSettingsDetail;
  const activeAvatar = hasDetailContent && avatarFocused ? avatarFocused : avatar;
  const contactVisible = contactOpen || contactHovered;
  const mobileDetailTitle = showSettingsDetail
    ? 'Customize'
    : selectedProject?.title || selectedWriting?.title || selectedInteraction?.title || ILLUSTRATION_CATEGORIES.find((category) => category.key === selectedCategory)?.label || 'Details';

  const moreTabs = SECONDARY_PORTFOLIO_TABS;
  const radialTabs = [...mainTabs, ...moreTabs];
  const navigationItems = radialTabs.map((tab) => {
    const meta = radialTabMeta[tab.key];
    return {
      key: tab.key,
      label: tab.label,
      icon: <RadialTabIcon icon={meta.icon} />,
    };
  });
  const activeNavigationItem = navigationItems.find((item) => item.key === activeTab) || navigationItems[0];
  const sectionNavigationAvatar = (
    <div
      className="section-navigation-avatar grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--experience-accent)] transition-opacity duration-[var(--experience-motion)]"
      aria-hidden="true"
    >
      <span className="grid h-5 w-5 place-items-center [&_svg]:h-5 [&_svg]:w-5">
        {activeNavigationItem?.icon}
      </span>
    </div>
  );
  const radialMenuItems: RadialToolkitItem[] = radialTabs.map((tab) => {
    const meta = radialTabMeta[tab.key];

    return {
      id: tab.key,
      label: tab.label,
      shortcut: meta.shortcut,
      icon: <RadialTabIcon icon={meta.icon} />,
      active: activeTab === tab.key,
      onSelect: () => handleTabChange(tab.key),
    };
  });
  const contactItems: { name: ContactIconName; label: string; href: string }[] = [
    { name: 'twitter', label: 'Twitter', href: siteConfig.social.twitter },
    { name: 'github', label: 'GitHub', href: siteConfig.social.github },
    { name: 'linkedin', label: 'LinkedIn', href: siteConfig.social.linkedin },
    { name: 'behance', label: 'Behance', href: siteConfig.social.behance },
    { name: 'instagram', label: 'Instagram', href: siteConfig.social.instagram },
  ];

  useEffect(() => {
    if (!hasDetailContent || typeof window === 'undefined') return;

    const media = window.matchMedia('(max-width: 767px)');
    if (!media.matches) return;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [hasDetailContent]);
  const contactLinks = (
    <>
      {contactItems.map((item) => (
        <a
          key={item.name}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            setContactOpen(false);
            setContactHovered(false);
          }}
          className="flex items-center gap-3 border-b border-gray-200 py-3 text-base font-normal text-gray-800 transition-colors last:border-b-0 hover:text-gray-950"
        >
          <ContactIcon name={item.name} />
          <span>{item.label}</span>
        </a>
      ))}
      <a
        href={`mailto:${siteConfig.social.email}`}
        onClick={() => {
          setContactOpen(false);
          setContactHovered(false);
        }}
        className="mt-2 flex items-center justify-center gap-3 rounded-full bg-black px-4 py-3 text-base font-normal text-white transition-colors hover:bg-gray-800"
      >
        <ContactIcon name="email" />
        <span>send me an email</span>
      </a>
    </>
  );
  const selectedDetailContent = selectedProject ? (
    <div key={contentAnimationKey} className="w-full max-w-[572px] animate-slideInFromRight">
      <div className="hidden md:sticky md:top-0 md:z-20 md:-mx-1 md:mb-6 md:block md:bg-background md:px-1 md:py-3">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedProject.title}</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
          {selectedProject.year && <span>{selectedProject.year}</span>}
          {selectedProject.role && <span>{selectedProject.role}</span>}
        </div>
      </div>

      {selectedProject.blocks && selectedProject.blocks.length > 0 ? (
        <div className="prose prose-gray max-w-none">
          <ContentBlocks blocks={selectedProject.blocks} />
        </div>
      ) : selectedProject.caseStudy ? (
        <div className="space-y-8">
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Overview</h3>
            <p className="text-base text-gray-600 leading-relaxed">{selectedProject.caseStudy.overview}</p>
          </section>
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Challenge</h3>
            <p className="text-base text-gray-600 leading-relaxed">{selectedProject.caseStudy.challenge}</p>
          </section>
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Approach</h3>
            <p className="text-base text-gray-600 leading-relaxed">{selectedProject.caseStudy.approach}</p>
          </section>
          <section>
            <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Outcome</h3>
            <p className="text-base text-gray-600 leading-relaxed">{selectedProject.caseStudy.outcome}</p>
          </section>
        </div>
      ) : (
        <p className="text-base text-gray-600 leading-relaxed">{selectedProject.description}</p>
      )}

      {selectedProject.link && (
        <a
          href={selectedProject.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-gray-900 transition-colors mt-8 inline-block"
        >
          View Project →
        </a>
      )}
    </div>
  ) : selectedWriting ? (
    <div key={contentAnimationKey} className="w-full max-w-[572px] animate-slideInFromRight">
      <div className="hidden md:sticky md:top-0 md:z-20 md:-mx-1 md:mb-6 md:block md:bg-background md:px-1 md:py-3">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedWriting.title}</h2>
        <div className="flex gap-4 text-sm text-gray-400">
          {selectedWriting.date && (
            <span>
              {new Date(selectedWriting.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {selectedWriting.cover && (
        <div className="mb-8 rounded-lg overflow-hidden">
          <OptimizedImage
            src={selectedWriting.cover}
            alt={selectedWriting.title}
            width={800}
            height={450}
            className="w-full h-auto"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      {selectedWriting.blocks && selectedWriting.blocks.length > 0 ? (
        <div className="prose prose-gray max-w-none">
          <ContentBlocks blocks={selectedWriting.blocks} />
        </div>
      ) : (
        <p className="text-base text-gray-600 leading-relaxed">{selectedWriting.description}</p>
      )}

      {selectedWriting.link && (
        <a
          href={selectedWriting.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-gray-900 transition-colors mt-8 inline-block"
        >
          Read More →
        </a>
      )}
    </div>
  ) : selectedInteraction ? (
    <div key={contentAnimationKey} className="w-full max-w-[572px] animate-slideInFromRight">
      <div className="hidden md:sticky md:top-0 md:z-20 md:-mx-1 md:mb-6 md:block md:bg-background md:px-1 md:py-3">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedInteraction.title}</h2>
      </div>

      <p className="text-base text-gray-600 leading-relaxed">{selectedInteraction.description}</p>

      {selectedInteraction.link && (
        <a
          href={selectedInteraction.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-gray-900 transition-colors mt-8 inline-block"
        >
          View Interaction →
        </a>
      )}
    </div>
  ) : selectedCategory ? (
    <div key={contentAnimationKey} className="w-full max-w-[572px] animate-slideInFromRight">
      <h2 className="hidden text-xl font-semibold text-gray-900 mb-6 md:block">
        {ILLUSTRATION_CATEGORIES.find(c => c.key === selectedCategory)?.label}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {content.illustrations
          .filter(item => (item.category || 'assets') === selectedCategory)
          .map((item) => {
            const youtubeId = item.youtubeUrl ? getYouTubeId(item.youtubeUrl) : null;
            return (
              <div key={item.id} className="group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {item.thumbnail ? (
                    <OptimizedImage
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-300 text-xs text-center px-2">{item.title}</span>
                    </div>
                  )}
                  {youtubeId && (
                    <button
                      onClick={() => setActiveVideo(item)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900 ml-0.5">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
                <h3 className="text-sm text-gray-900 mt-2">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
            );
          })}
      </div>
    </div>
  ) : null;

  const radialTrigger = (
    <button
      ref={radialTriggerRef}
      type="button"
      onClick={handleRadialTrigger}
      onMouseEnter={handleRadialHoverStart}
      onMouseLeave={scheduleRadialClose}
      aria-expanded={showMoreTabs}
      aria-label="Open radial navigation options"
      className={`w-6 h-6 rounded-full border border-[var(--experience-border)] flex items-center justify-center text-[var(--experience-muted)] hover:text-[var(--experience-text)] transition-all ${
        showMoreTabs ? 'rotate-45 bg-[var(--experience-card)] text-[var(--experience-text)]' : ''
      }`}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="6" y1="2" x2="6" y2="10" />
        <line x1="2" y1="6" x2="10" y2="6" />
      </svg>
    </button>
  );
  const settingsTrigger = (
    <SettingsTrigger
      selected={showSettingsDetail}
      onClick={openSettings}
    />
  );
  const settingsDetailContent = showSettingsDetail ? (
    <div key={contentAnimationKey} className="home-settings-detail w-full max-w-[572px] animate-slideInFromRight">
      <CustomizeExperienceContent />
    </div>
  ) : null;
  const renderContentAvatarButtons = ({
    keyPrefix,
    rowClassName = 'project-avatar-row flex items-center justify-center',
  }: {
    keyPrefix: string;
    rowClassName?: string;
  }) => {
    const colors = [
      'from-blue-400 to-cyan-400',
      'from-purple-400 to-pink-400',
      'from-orange-400 to-red-400',
      'from-green-400 to-teal-400',
      'from-indigo-400 to-purple-400',
      'from-pink-400 to-rose-400',
    ];

    const renderAvatar = (
      key: string,
      title: string,
      imageSrc: string | undefined,
      isActive: boolean,
      index: number,
      onClick: () => void,
      fallbackSymbol = title.charAt(0),
    ) => {
      const stateClass = isActive
        ? 'opacity-100 visible'
        : 'opacity-0 invisible pointer-events-none';
      const colorClass = colors[index % colors.length];

      return (
        <button
          key={`${keyPrefix}-${key}`}
          type="button"
          onClick={onClick}
          className={rowClassName}
          aria-label={`Open ${title}`}
          aria-hidden={!isActive}
          disabled={!isActive}
          tabIndex={isActive ? 0 : -1}
        >
          <span className={`grid h-10 w-10 flex-shrink-0 place-items-center transition-opacity duration-150 ${stateClass}`}>
            {imageSrc ? (
              <AvatarImage
                src={imageSrc}
                alt={title}
                width={40}
                height={40}
                className="h-auto max-h-10 w-auto max-w-10 object-contain"
              />
            ) : (
              <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${colorClass}`}>
                <span className="text-sm font-medium text-white">{fallbackSymbol}</span>
              </span>
            )}
          </span>
        </button>
      );
    };

    if (activeTab === 'writings') {
      return content.writings.map((writing, index) => renderAvatar(
        writing.id,
        writing.title,
        writing.avatar,
        selectedWriting?.id === writing.id,
        index,
        () => handleSelectWriting(writing),
      ));
    }

    if (activeTab === 'illustration') {
      return ILLUSTRATION_CATEGORIES.map((cat, index) => {
        const categoryPreview = content.illustrations.find((item) => (item.category || 'assets') === cat.key);
        return renderAvatar(
          cat.key,
          cat.label,
          categoryPreview?.avatar || categoryPreview?.thumbnail,
          selectedCategory === cat.key,
          index,
          () => handleSelectCategory(cat.key),
          cat.label.charAt(0),
        );
      });
    }

    if (activeTab === 'interaction') {
      return content.interactions.map((interaction, index) => renderAvatar(
        interaction.id,
        interaction.title,
        interaction.avatar,
        selectedInteraction?.id === interaction.id,
        index,
        () => handleSelectInteraction(interaction),
      ));
    }

    return content.projects.map((project, index) => renderAvatar(
      project.id,
      project.title,
      project.avatar,
      selectedProject?.id === project.id || (!hasDetailContent && hoveredProject?.id === project.id),
      index,
      () => handleSelectProject(project),
    ));
  };
  const contentAvatarButtons = renderContentAvatarButtons({ keyPrefix: 'desktop-content-avatar' });
  const mobileContentAvatarButtons = renderContentAvatarButtons({
    keyPrefix: 'mobile-content-avatar',
    rowClassName: 'mobile-rail-avatar-row flex h-[60px] items-center justify-center py-3',
  });
  const mobileNameAvatar = (
    <button
      type="button"
      onClick={handleClearSelection}
      className="mobile-name-avatar flex h-[60px] items-center justify-center py-3"
      aria-label="Show all work"
    >
      <span className="flex-shrink-0 opacity-100 scale-100 transition-all duration-150">
        {(() => {
          const avatarSrc = activeAvatar;
          return avatarSrc ? (
            <AvatarImage
              src={avatarSrc}
              alt={siteConfig.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400">
              <span className="text-sm font-medium text-white">
                {siteConfig.name.charAt(0)}
              </span>
            </span>
          );
        })()}
      </span>
    </button>
  );
  const mobileDetailRail = (
    <div
      className={`mobile-detail-rail md:hidden ${hasDetailContent ? 'mobile-detail-rail--active' : ''}`}
      aria-hidden={!hasDetailContent}
    >
      {mobileNameAvatar}
      {mobileContentAvatarButtons}
    </div>
  );
  const desktopProfileAvatar = (
    <button
      onClick={handleClearSelection}
      className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
    >
      {(() => {
        const avatarSrc = activeAvatar;
        return avatarSrc ? (
          <AvatarImage
            src={avatarSrc}
            alt={siteConfig.name}
            width={40}
            height={40}
            className="w-full h-full object-cover transition-all duration-200"
          />
        ) : (
          <span className="text-sm font-medium text-white">
            {siteConfig.name.charAt(0)}
          </span>
        );
      })()}
    </button>
  );
  const desktopSectionAvatar = (
    <div
      className={`mb-6 flex h-5 items-center justify-center overflow-visible transition-opacity ${
        showSettingsDetail ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {sectionNavigationAvatar}
    </div>
  );
  const desktopAvatarUtility = (
    <div className="mt-4 flex flex-col items-center z-50">
      <div className="mb-3">
        {settingsTrigger}
      </div>
      <div className={`flex h-[72px] items-center justify-center transition-opacity ${hasDetailContent ? 'opacity-30' : ''}`}>
        <NowPlayingImage data={nowPlayingData} />
      </div>
    </div>
  );

  return (
    <PortfolioHomeFrame>
      {mobileDetailRail}
      {/* Main content area */}
      <PortfolioDesktopGrid>
        <DesktopAvatarRail
          profile={desktopProfileAvatar}
          section={desktopSectionAvatar}
          content={activeTab === 'projects' ? null : contentAvatarButtons}
          utility={desktopAvatarUtility}
          contentRef={avatarContainerRef}
        />

        {/* Left Content Column - Fixed at 100vh */}
        <PortfolioSidebar>
          {/* Identity */}
          <div
            className={`hidden md:block h-auto mb-6 transition-opacity ${
              showSettingsDetail ? 'pointer-events-none opacity-0' : hasDetailContent ? 'opacity-60' : ''
            }`}
            aria-hidden={showSettingsDetail}
          >
            <h1 className="text-base font-semibold text-gray-900">
              {siteConfig.name}
            </h1>
            <p className="text-base font-normal text-gray-500">{siteConfig.title}</p>
          </div>
          {!hasDetailContent && (
            <div className="md:hidden mb-6 transition-opacity">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 overflow-hidden"
                  aria-label="Show all work"
                >
                  {(() => {
                    const avatarSrc = avatar;
                    return avatarSrc ? (
                      <AvatarImage
                        src={avatarSrc}
                        alt={siteConfig.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">
                        {siteConfig.name.charAt(0)}
                      </span>
                    );
                  })()}
                </button>
                <div>
                  <h1 className="text-base font-semibold text-gray-900">{siteConfig.name}</h1>
                  <p className="text-sm text-gray-500">{siteConfig.title}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          {!showSettingsDetail && (
            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-[-10px] z-40 md:hidden">
                {sectionNavigationAvatar}
              </div>
              <PortfolioNavigation
                items={navigationItems}
                activeTab={activeTab}
                onChange={handleTabChange}
                radialTrigger={radialTrigger}
              />
            </div>
          )}

          {/* Content List */}
          <CustomScrollbar
            className={`flex-1 min-h-0 ${hasDetailContent ? 'hidden md:block' : ''}`}
            position="right"
            thumbHeight={30}
            thumbWidth={2}
            contentClassName={PROJECT_LIST_CONTENT_CLASS}
            contentRef={contentListRef}
            onContentRefChange={handleContentListRef}
          >
            <div className={hasDetailContent ? 'hidden md:block' : ''}>
            {activeTab === 'projects' && (
              <ProjectBrowser
                projects={content.projects}
                selectedProject={selectedProject}
                hasSelection={hasSelection}
                onSelect={handleSelectProject}
                onHover={(project) => {
                  if (project) setPreviewImageIndex(0);
                  setHoveredProject(project);
                }}
              />
            )}

            {activeTab === 'interaction' && (
              <div>
                {content.interactions.map((item) => {
                  const isSelected = selectedInteraction?.id === item.id;

                  return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectInteraction(isSelected ? null : item)}
                    className={`group block w-full py-3 text-left transition-opacity ${hasSelection && !isSelected ? 'opacity-30' : ''}`}
                  >
                    <h3 className="text-base font-medium text-gray-900 mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {item.description}
                    </p>
                  </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'illustration' && (
              <div>
                {ILLUSTRATION_CATEGORIES.map((cat) => {
                  const count = content.illustrations.filter(i => (i.category || 'assets') === cat.key).length;
                  const isSelected = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => handleSelectCategory(isSelected ? null : cat.key)}
                      className={`group block py-3 w-full text-left transition-opacity ${hasSelection && !isSelected ? 'opacity-30' : ''}`}
                    >
                      <h2 className={`text-base font-normal mb-0.5 transition-colors ${
                        isSelected
                          ? 'text-gray-900'
                          : 'text-gray-900 group-hover:text-gray-600'
                      }`}>
                        {cat.label}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {count} {count === 1 ? 'item' : 'items'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'writings' && (() => {
              const writingsByYear = content.writings.reduce((acc, item) => {
                const year = item.date ? new Date(item.date).getFullYear().toString() : 'Unknown';
                if (!acc[year]) acc[year] = [];
                acc[year].push(item);
                return acc;
              }, {} as Record<string, typeof content.writings>);

              const sortedYears = Object.keys(writingsByYear).sort((a, b) => Number(b) - Number(a));

              const isNew = (date?: string) => {
                if (!date) return false;
                const itemDate = new Date(date);
                const now = new Date();
                const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
                return diffDays <= 30;
              };

              return (
                <div className="space-y-2">
                  {sortedYears.map((year) => (
                    <div key={year}>
                      {writingsByYear[year].map((item, index) => {
                        const isSelected = selectedWriting?.id === item.id;

                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectWriting(isSelected ? null : item)}
                            className={`group flex w-full flex-col sm:flex-row sm:items-baseline py-3 border-b border-gray-100 last:border-0 gap-1 sm:gap-0 text-left transition-opacity ${hasSelection && !isSelected ? 'opacity-30' : ''}`}
                          >
                            <span className="w-16 text-sm text-gray-300 flex-shrink-0 hidden sm:block">
                              {index === 0 ? year : ''}
                            </span>
                            <div className="flex-1 flex items-center gap-2">
                              <h3 className={`text-base font-medium transition-colors ${
                                isSelected
                                  ? 'text-gray-900'
                                  : 'text-gray-900 group-hover:text-gray-600'
                              }`}>
                                {item.title}
                              </h3>
                              {isNew(item.date) && (
                                <span className="text-xs text-pink-500 border border-pink-300 rounded-full px-2 py-0.5">New</span>
                              )}
                            </div>
                            <span className="text-sm text-gray-300 flex-shrink-0 sm:ml-8">
                              {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '/') : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}
            </div>
          </CustomScrollbar>

          {/* Now Playing - Desktop only, pinned to bottom */}
          <div className={`hidden md:block flex-shrink-0 mt-auto pt-4 transition-opacity overflow-visible z-50 ${hasDetailContent ? 'opacity-30' : ''}`}>
            <div className={`overflow-visible ${activeTab === 'illustration' ? 'w-full md:w-[calc(166%+1.5rem)]' : ''}`}>
              <NowPlayingContent data={nowPlayingData} showImage={false} />
            </div>
          </div>
        </PortfolioSidebar>

        {/* Right Column - Content Display (scrollable) */}
        <PortfolioDetailColumn showTopFade={!showSettingsDetail}>
          <CustomScrollbar
            className="absolute inset-0"
            position="left"
            thumbHeight={30}
            thumbWidth={2}
            contentClassName="pl-8"
          >
          {showSettingsDetail ? (
            settingsDetailContent
          ) : selectedProject ? (
            // Show full project content when selected
            <div key={contentAnimationKey} className="w-full max-w-[572px] animate-slideInFromRight">
              {/* Project Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedProject.title}</h2>
              <div className="flex gap-4 text-sm text-gray-400 mb-6">
                {selectedProject.year && <span>{selectedProject.year}</span>}
                {selectedProject.role && <span>{selectedProject.role}</span>}
              </div>

              {/* Project Content */}
              {selectedProject.blocks && selectedProject.blocks.length > 0 ? (
                <div className="prose prose-gray max-w-none">
                  <ContentBlocks blocks={selectedProject.blocks} />
                </div>
              ) : selectedProject.caseStudy ? (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Overview</h3>
                    <p className="text-base text-gray-600 leading-relaxed">{selectedProject.caseStudy.overview}</p>
                  </section>
                  <section>
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Challenge</h3>
                    <p className="text-base text-gray-600 leading-relaxed">{selectedProject.caseStudy.challenge}</p>
                  </section>
                  <section>
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Approach</h3>
                    <p className="text-base text-gray-600 leading-relaxed">{selectedProject.caseStudy.approach}</p>
                  </section>
                  <section>
                    <h3 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Outcome</h3>
                    <p className="text-base text-gray-600 leading-relaxed">{selectedProject.caseStudy.outcome}</p>
                  </section>
                </div>
              ) : (
                <p className="text-base text-gray-600 leading-relaxed">{selectedProject.description}</p>
              )}

              {/* Project Link */}
              {selectedProject.link && (
                <a
                  href={selectedProject.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-gray-900 transition-colors mt-8 inline-block"
                >
                  View Project →
                </a>
              )}
            </div>
          ) : selectedWriting ? (
            // Show full writing content when selected
            <div key={contentAnimationKey} className="w-full max-w-[572px] animate-slideInFromRight">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedWriting.title}</h2>
              <div className="flex gap-4 text-sm text-gray-400 mb-6">
                {selectedWriting.date && (
                  <span>
                    {new Date(selectedWriting.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>

              {selectedWriting.cover && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={selectedWriting.cover}
                    alt={selectedWriting.title}
                    width={800}
                    height={450}
                    className="w-full h-auto"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}

              {selectedWriting.blocks && selectedWriting.blocks.length > 0 ? (
                <div className="prose prose-gray max-w-none">
                  <ContentBlocks blocks={selectedWriting.blocks} />
                </div>
              ) : (
                <p className="text-base text-gray-600 leading-relaxed">{selectedWriting.description}</p>
              )}

              {selectedWriting.link && (
                <a
                  href={selectedWriting.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-gray-900 transition-colors mt-8 inline-block"
                >
                  Read More →
                </a>
              )}
            </div>
          ) : selectedInteraction ? (
            <div key={contentAnimationKey} className="w-full max-w-[572px] animate-slideInFromRight">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{selectedInteraction.title}</h2>
              <p className="text-base text-gray-600 leading-relaxed">{selectedInteraction.description}</p>

              {selectedInteraction.link && (
                <a
                  href={selectedInteraction.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-gray-900 transition-colors mt-8 inline-block"
                >
                  View Interaction →
                </a>
              )}
            </div>
          ) : selectedCategory ? (
            // Show illustrations grid when category is selected
            <div key={contentAnimationKey} className="w-full max-w-[572px] animate-slideInFromRight">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {ILLUSTRATION_CATEGORIES.find(c => c.key === selectedCategory)?.label}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {content.illustrations
                  .filter(item => (item.category || 'assets') === selectedCategory)
                  .map((item) => {
                    const youtubeId = item.youtubeUrl ? getYouTubeId(item.youtubeUrl) : null;
                    return (
                      <div key={item.id} className="group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                          {item.thumbnail ? (
                            <OptimizedImage
                              src={item.thumbnail}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-300 text-xs">{item.title}</span>
                            </div>
                          )}
                          {youtubeId && (
                            <button
                              onClick={() => setActiveVideo(item)}
                              className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900 ml-0.5">
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              </div>
                            </button>
                          )}
                        </div>
                        <h3 className="text-sm text-gray-900 mt-2">{item.title}</h3>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : null}
          </CustomScrollbar>
        </PortfolioDetailColumn>
        <div className="hidden md:block md:col-[4]" aria-hidden="true" />
      </PortfolioDesktopGrid>

      <AnimatePresence>
        {hasDetailContent && (settingsDetailContent || selectedDetailContent) && (
          <motion.div
            className="mobile-detail-pane md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={mobileDetailTitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mobile-detail-scroll">
              <div className={`mobile-detail-content ${showSettingsDetail ? 'mobile-detail-content--settings' : ''}`}>
                <div className="min-w-0 flex-1">
                  {!showSettingsDetail && !selectedProject && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      aria-label="Close details"
                      className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-[var(--experience-surface)] text-[var(--experience-muted)] transition-colors hover:text-[var(--experience-text)]"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
                        <path d="M4 4l8 8M12 4l-8 8" />
                      </svg>
                    </button>
                  )}
                  {showSettingsDetail ? (
                    <CustomizeExperienceContent />
                  ) : (
                    selectedDetailContent
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Section */}
      <div className={`md:hidden ${hasDetailContent ? 'absolute bottom-5 left-2 right-3 z-[9020] pt-0' : 'shrink-0 pt-4'}`}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {settingsTrigger}
          </div>
          {!hasDetailContent && (
            <div className="flex items-center gap-3">
              <NowPlayingImage data={nowPlayingData} useAlbumArt />
              <div className="min-w-0">
                {nowPlayingData?.isPlaying ? (
                  <>
                    <a href={nowPlayingData.songUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors truncate block">
                      {nowPlayingData.title}
                    </a>
                    <p className="text-sm text-gray-400 truncate">{nowPlayingData.artist}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-900">Not listening right now</p>
                    {nowPlayingData?.lastPlayed ? (
                      <p className="text-sm text-gray-400 truncate">last: {nowPlayingData.lastPlayed.title}</p>
                    ) : (
                      <p className="text-sm text-gray-400">check again shortly</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <RadialToolkit
        anchor={radialAnchor}
        items={radialMenuItems}
        open={showMoreTabs}
        onClose={closeRadialMenu}
        onMouseEnter={clearRadialCloseTimer}
        onMouseLeave={scheduleRadialClose}
      />

      <button
        type="button"
        aria-label="Close contact links"
        onClick={() => {
          setContactOpen(false);
          setContactHovered(false);
        }}
        className={`fixed inset-0 z-[9998] bg-[#a3a3a3]/[0.33] backdrop-blur-[4px] transition-opacity duration-150 md:hidden ${
          contactVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Floating Contact */}
      <div
        className="fixed bottom-4 right-4 z-[9999] md:bottom-6 md:right-6"
        onMouseEnter={() => setContactHovered(true)}
        onMouseLeave={() => setContactHovered(false)}
      >
        <div
          style={contactCardBorderStyle}
          className={`absolute bottom-full right-0 mb-3 w-72 rounded-[20px] bg-white p-5 transition-all duration-150 ${
            contactVisible
              ? 'translate-y-0 scale-100 opacity-100 pointer-events-auto'
              : 'translate-y-2 scale-95 opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col">
            {contactLinks}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setContactOpen((open) => !open)}
          aria-expanded={contactVisible}
          aria-label="Open contact links"
          style={contactCardBorderStyle}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/95 py-1.5 pl-2 pr-4 text-sm font-medium text-gray-900 backdrop-blur transition-colors hover:bg-gray-50"
        >
          <span className="relative block h-6 w-6 overflow-hidden rounded-full bg-gray-100">
            <Image
              src="/chat-icon.jpg"
              alt=""
              fill
              sizes="24px"
              className="object-cover"
              priority
            />
          </span>
          <span>Contact</span>
        </button>
      </div>

      {/* Hover Preview - Centered on screen */}
      {hoveredProject && projectImages.length > 0 && !selectedProject && (
        <div className="hidden md:flex fixed inset-0 items-center justify-center pointer-events-none z-10">
          <div className="relative w-[72vw] h-[72vh] transition-opacity duration-300">
            <Image
              key={projectImages[previewImageIndex]}
              src={projectImages[previewImageIndex % projectImages.length]}
              alt={hoveredProject.title}
              fill
              className="object-contain"
              sizes="72vw"
            />
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && activeVideo.youtubeUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8" onClick={() => setActiveVideo(null)}>
          <div className="relative w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.youtubeUrl)}?autoplay=1`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button onClick={() => setActiveVideo(null)} className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </PortfolioHomeFrame>
  );
}
