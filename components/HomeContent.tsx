'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import OptimizedImage from './OptimizedImage';
import { Project, Illustration, ContentBlock, IllustrationCategory } from '@/lib/data';
import { useNowPlaying, NowPlayingContent, NowPlayingImage } from './NowPlaying';
import CustomScrollbar from './CustomScrollbar';

function getGitHubUsername(url: string): string | null {
  const match = url.match(/github\.com\/([^\/]+)/);
  return match ? match[1] : null;
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

interface SiteConfig {
  name: string;
  title: string;
  avatar: string;
  avatarFocused?: string;
  bio: string;
  social: {
    twitter: string;
    github: string;
    linkedin: string;
    email: string;
    behance: string;
    instagram: string;
  };
  socialImages?: {
    twitter?: string;
    linkedin?: string;
    behance?: string;
    instagram?: string;
    email?: string;
  };
}

interface ContentData {
  projects: Project[];
  writings: { id: string; slug: string; title: string; description: string; cover?: string; date?: string; avatar?: string }[];
  illustrations: (Illustration & { category?: IllustrationCategory })[];
  interactions: { id: string; slug: string; title: string; description: string }[];
}

const ILLUSTRATION_CATEGORIES: { key: IllustrationCategory; label: string }[] = [
  { key: 'app-icons', label: 'App Icons' },
  { key: 'characters', label: 'Character Illustrations' },
  { key: 'assets', label: 'Assets' },
];

interface HomeContentProps {
  initialConfig: SiteConfig;
  initialContent: ContentData;
}

type Tab = 'projects' | 'interaction' | 'illustration' | 'writings';

// Render content blocks for project details
function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={index} className="text-base font-semibold text-gray-900 mt-8 mb-4">
          {block.content}
        </h2>
      );
    case 'text':
      return (
        <p key={index} className="text-base text-gray-600 leading-relaxed mb-4">
          {block.content}
        </p>
      );
    case 'image':
      return (
        <div key={index} className="my-6 rounded-lg overflow-hidden">
          <OptimizedImage
            src={block.content}
            alt=""
            width={800}
            height={600}
            className="w-full h-auto"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      );
    case 'quote':
      return (
        <blockquote key={index} className="border-l-2 border-gray-200 pl-4 my-6 text-gray-500 italic">
          {block.content}
        </blockquote>
      );
    case 'code':
      return (
        <pre key={index} className="bg-gray-50 rounded-lg p-4 my-6 overflow-x-auto text-sm">
          <code>{block.content}</code>
        </pre>
      );
    case 'svg':
      return (
        <div key={index} className="my-6" dangerouslySetInnerHTML={{ __html: block.content }} />
      );
    default:
      return null;
  }
}

export default function HomeContent({ initialConfig, initialContent }: HomeContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<IllustrationCategory | null>(null);
  const [activeVideo, setActiveVideo] = useState<Illustration | null>(null);
  const [playingInlineId, setPlayingInlineId] = useState<string | null>(null);
  const [githubHovered, setGithubHovered] = useState(false);
  const [githubMousePos, setGithubMousePos] = useState({ x: 0, y: 0 });
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [socialMousePos, setSocialMousePos] = useState({ x: 0, y: 0 });
  const [slidingAvatar, setSlidingAvatar] = useState<{ fromIndex: number; toIndex: number; phase: 'sliding' | 'idle' } | null>(null);
  const [displayedAvatarProject, setDisplayedAvatarProject] = useState<Project | null>(null);
  const [avatarTopPosition, setAvatarTopPosition] = useState<number>(0);
  const [contentAnimationKey, setContentAnimationKey] = useState<string | null>(null);
  const githubRef = useRef<HTMLAnchorElement>(null);
  const socialRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const projectItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentProjectRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const avatarContainerRef = useRef<HTMLDivElement>(null);
  const contentListRef = useRef<HTMLDivElement>(null);
  const nowPlayingData = useNowPlaying();
  const isInitialized = useRef(false);
  const prevSelectedProject = useRef<Project | null>(null);

  const siteConfig = initialConfig;
  const content = initialContent;

  // Preload both avatar images on mount to prevent delay when switching
  useEffect(() => {
    if (siteConfig.avatar) {
      const img1 = new window.Image();
      img1.src = siteConfig.avatar;
    }
    if (siteConfig.avatarFocused) {
      const img2 = new window.Image();
      img2.src = siteConfig.avatarFocused;
    }
  }, [siteConfig.avatar, siteConfig.avatarFocused]);

  // Update URL when selection changes
  const updateURL = useCallback((projectSlug: string | null, category: IllustrationCategory | null) => {
    const params = new URLSearchParams();
    if (projectSlug) {
      params.set('project', projectSlug);
    } else if (category) {
      params.set('category', category);
    }
    const newURL = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Initialize state from URL on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const projectSlug = searchParams.get('project');
    const category = searchParams.get('category') as IllustrationCategory | null;

    if (projectSlug) {
      const project = content.projects.find(p => p.slug === projectSlug);
      if (project) {
        setActiveTab('projects');
        setSelectedProject(project);
      }
    } else if (category && ILLUSTRATION_CATEGORIES.some(c => c.key === category)) {
      setActiveTab('illustration');
      setSelectedCategory(category);
    }
  }, [searchParams, content.projects]);

  // Wrapper functions to update selection and URL together
  const handleSelectProject = useCallback((project: Project | null) => {
    setSelectedProject(project);
    setContentAnimationKey(project ? `project-${project.id}-${Date.now()}` : null);
    updateURL(project?.slug || null, null);
  }, [updateURL]);

  const handleSelectCategory = useCallback((category: IllustrationCategory | null) => {
    setSelectedCategory(category);
    setSelectedProject(null);
    setContentAnimationKey(category ? `category-${category}-${Date.now()}` : null);
    updateURL(null, category);
  }, [updateURL]);

  const handleClearSelection = useCallback(() => {
    setSelectedProject(null);
    setSelectedCategory(null);
    setContentAnimationKey(null);
    updateURL(null, null);
  }, [updateURL]);

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
    if (selectedProject || !hoveredProject || projectImages.length <= 1) {
      setPreviewImageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setPreviewImageIndex((prev) => (prev + 1) % projectImages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [hoveredProject, projectImages.length, selectedProject]);

  // Clear selections when switching tabs
  useEffect(() => {
    if (isInitialized.current) {
      handleClearSelection();
    }
  }, [activeTab, handleClearSelection]);

  // Handle sliding avatar animation when project changes
  useEffect(() => {
    if (activeTab !== 'projects') {
      setDisplayedAvatarProject(null);
      prevSelectedProject.current = null;
      return;
    }

    const prevProject = prevSelectedProject.current;
    const newProject = selectedProject;

    // If hovering and no selection, show hovered avatar (handled separately)
    if (!newProject && !hoveredProject) {
      setDisplayedAvatarProject(null);
      setSlidingAvatar(null);
      prevSelectedProject.current = null;
      return;
    }

    // If only hovering (no selection), don't update via this effect
    if (!newProject) {
      prevSelectedProject.current = null;
      return;
    }

    if (!prevProject) {
      // First selection - no animation, just show
      setDisplayedAvatarProject(newProject);
      setSlidingAvatar(null);
      prevSelectedProject.current = newProject;
      return;
    }

    if (prevProject.id === newProject.id) {
      return;
    }

    // Animate from prev to new
    const fromIndex = content.projects.findIndex(p => p.id === prevProject.id);
    const toIndex = content.projects.findIndex(p => p.id === newProject.id);

    if (fromIndex === -1 || toIndex === -1) {
      setDisplayedAvatarProject(newProject);
      prevSelectedProject.current = newProject;
      return;
    }

    // Start sliding animation (synced with content panel: 200ms)
    setSlidingAvatar({ fromIndex, toIndex, phase: 'sliding' });
    setDisplayedAvatarProject(prevProject); // Start with old avatar

    // Change avatar halfway through
    const halfwayTimer = setTimeout(() => {
      setDisplayedAvatarProject(newProject);
    }, 100); // Half of 200ms animation

    // End animation
    const endTimer = setTimeout(() => {
      setSlidingAvatar(null);
      prevSelectedProject.current = newProject;
    }, 200);

    return () => {
      clearTimeout(halfwayTimer);
      clearTimeout(endTimer);
    };
  }, [selectedProject, activeTab, content.projects, hoveredProject]);

  // Handle hover avatar (only when no project is selected)
  useEffect(() => {
    if (activeTab !== 'projects' || selectedProject) {
      return;
    }

    if (hoveredProject) {
      setDisplayedAvatarProject(hoveredProject);
      setSlidingAvatar(null);
    } else {
      setDisplayedAvatarProject(null);
    }
  }, [hoveredProject, selectedProject, activeTab]);

  // Calculate avatar position based on actual DOM measurements
  useEffect(() => {
    if (!displayedAvatarProject || activeTab !== 'projects') {
      return;
    }

    const calculatePosition = () => {
      const projectButton = contentProjectRefs.current[displayedAvatarProject.id];
      const contentList = contentListRef.current;
      const avatarContainer = avatarContainerRef.current;

      if (projectButton && contentList && avatarContainer) {
        const buttonRect = projectButton.getBoundingClientRect();
        const containerRect = avatarContainer.getBoundingClientRect();

        // Calculate the center of the project button relative to the avatar container
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        const relativeTop = buttonCenterY - containerRect.top - 20; // 20 = half of 40px avatar

        setAvatarTopPosition(relativeTop);
      }
    };

    calculatePosition();

    // Recalculate on scroll
    const contentList = contentListRef.current;
    if (contentList) {
      contentList.addEventListener('scroll', calculatePosition);
      return () => contentList.removeEventListener('scroll', calculatePosition);
    }
  }, [displayedAvatarProject, activeTab, slidingAvatar]);

  const mainTabs: { key: Tab; label: string }[] = [
    { key: 'projects', label: 'Projects' },
    { key: 'illustration', label: 'Illustration' },
    { key: 'writings', label: 'Writings' },
  ];

  // Track if anything is selected to fade other elements
  const hasSelection = selectedProject !== null || selectedCategory !== null;

  const moreTabs: { key: Tab; label: string }[] = [
    { key: 'interaction', label: 'Interaction' },
  ];

  return (
    <div className="h-screen flex flex-col pt-16 pb-4 md:pt-32 md:pb-8 pl-2 pr-3 md:px-6">
      {/* Main content area */}
      <div className="flex-1 flex md:grid md:grid-cols-12 gap-4 md:gap-6 min-h-0 overflow-visible">
        {/* Avatar Column */}
        <div className="hidden md:flex md:col-span-1 flex-col items-end h-full">
          {/* User Avatar - matches Name section height */}
          <div className="h-14 mb-4 flex items-start">
            <button
              onClick={handleClearSelection}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
            >
              {(() => {
                const avatarSrc = hasSelection && siteConfig.avatarFocused ? siteConfig.avatarFocused : siteConfig.avatar;
                return avatarSrc ? (
                  <Image
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
          </div>

          {/* Tabs spacer */}
          <div className="mb-6 h-6" />

          {/* Project Avatars - synced with content list */}
          <div ref={avatarContainerRef} className="flex-1 overflow-y-auto min-h-0 relative">
            {activeTab === 'projects' && (
              <>
                {/* Invisible placeholders matching content item structure */}
                {content.projects.map((project) => (
                  <div
                    key={project.id}
                    ref={(el) => { projectItemRefs.current[project.id] = el; }}
                    className="py-3 flex items-center justify-end"
                  >
                    {/* Match content structure: title (text-base ~20px) + description (text-sm ~20px) = ~40px */}
                    <div className="w-10">
                      <div className="text-base mb-0.5 leading-tight">&nbsp;</div>
                      <div className="text-sm leading-tight">&nbsp;</div>
                    </div>
                  </div>
                ))}

                {/* Sliding avatar */}
                {displayedAvatarProject && (
                  <div
                    className={`absolute right-0 w-10 h-10 flex items-center justify-center ${
                      slidingAvatar ? 'transition-all duration-200 ease-out' : selectedProject ? 'transition-all duration-200 ease-out' : 'transition-opacity duration-150'
                    }`}
                    style={{
                      top: `${avatarTopPosition}px`,
                    }}
                  >
                    {(() => {
                      const projectIndex = content.projects.findIndex(p => p.id === displayedAvatarProject.id);
                      const colors = [
                        'from-blue-400 to-cyan-400',
                        'from-purple-400 to-pink-400',
                        'from-orange-400 to-red-400',
                        'from-green-400 to-teal-400',
                        'from-indigo-400 to-purple-400',
                        'from-pink-400 to-rose-400',
                      ];
                      const colorClass = colors[projectIndex % colors.length];

                      return displayedAvatarProject.avatar ? (
                        <Image
                          src={displayedAvatarProject.avatar}
                          alt={displayedAvatarProject.title}
                          width={40}
                          height={40}
                          className="w-auto h-auto max-w-[40px] max-h-[40px] object-contain"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                          <span className="text-sm font-medium text-white">
                            {displayedAvatarProject.title.charAt(0)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
            {activeTab === 'illustration' && ILLUSTRATION_CATEGORIES.map((cat, index) => {
              const isSelected = selectedCategory === cat.key;
              const colors = [
                'from-yellow-400 to-orange-400',
                'from-pink-400 to-purple-400',
                'from-cyan-400 to-blue-400',
              ];
              const colorClass = colors[index % colors.length];

              return (
                <div key={cat.key} className="py-3 flex items-start justify-end">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                    <span className="text-base">
                      {cat.key === 'app-icons' ? '📱' : cat.key === 'characters' ? '🎨' : '🖼️'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left Content Column - Fixed at 100vh, non-scrollable */}
        <div className="flex-1 md:col-span-3 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Name */}
          <div className={`h-auto md:h-14 mb-6 md:mb-4 transition-opacity ${hasSelection ? 'opacity-60' : ''}`}>
            <h1 className="text-base font-semibold text-gray-900">
              {siteConfig.name}
            </h1>
            <p className="text-base font-normal text-gray-500">{siteConfig.title}</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base mb-6">
            {mainTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`transition-all font-normal ${
                  activeTab === tab.key
                    ? `text-gray-900 ${hasSelection ? 'opacity-60' : ''}`
                    : `text-gray-400 hover:text-gray-600 ${hasSelection ? 'opacity-30' : ''}`
                }`}
              >
                {tab.label}
              </button>
            ))}
            {showMoreTabs && moreTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`transition-all font-normal ${
                  activeTab === tab.key
                    ? `text-gray-900 ${hasSelection ? 'opacity-60' : ''}`
                    : `text-gray-400 hover:text-gray-600 ${hasSelection ? 'opacity-30' : ''}`
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => setShowMoreTabs(!showMoreTabs)}
              className={`w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-all ${hasSelection ? 'opacity-30' : ''}`}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                {showMoreTabs ? (
                  <line x1="2" y1="6" x2="10" y2="6" />
                ) : (
                  <>
                    <line x1="6" y1="2" x2="6" y2="10" />
                    <line x1="2" y1="6" x2="10" y2="6" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {/* Content List */}
          <div ref={contentListRef} className="flex-1 overflow-hidden min-h-0">
            {activeTab === 'projects' && (
              <div>
                {content.projects.map((project) => {
                  const isSelected = selectedProject?.id === project.id;
                  return (
                    <button
                      key={project.id}
                      ref={(el) => { contentProjectRefs.current[project.id] = el; }}
                      onClick={() => handleSelectProject(isSelected ? null : project)}
                      className={`group block py-3 w-full text-left transition-opacity ${hasSelection && !isSelected ? 'opacity-30' : ''}`}
                      onMouseEnter={() => !selectedProject && setHoveredProject(project)}
                      onMouseLeave={() => !selectedProject && setHoveredProject(null)}
                    >
                      <h2 className={`text-base font-normal mb-0.5 transition-colors ${
                        isSelected
                          ? 'text-gray-900'
                          : 'text-gray-900 group-hover:text-gray-600'
                      }`}>
                        {project.title}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {project.year} <span className="mx-1">·</span> {project.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'interaction' && (
              <div className={`transition-opacity ${hasSelection ? 'opacity-30' : ''}`}>
                {content.interactions.map((item) => (
                  <article key={item.id} className="py-3">
                    <h3 className="text-base font-medium text-gray-900 mb-0.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {item.description}
                    </p>
                  </article>
                ))}
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
                <div className={`space-y-2 transition-opacity ${hasSelection ? 'opacity-30' : ''}`}>
                  {sortedYears.map((year) => (
                    <div key={year}>
                      {writingsByYear[year].map((item, index) => (
                        <Link key={item.id} href={`/writing/${item.slug}`} className="group flex flex-col sm:flex-row sm:items-baseline py-3 border-b border-gray-100 last:border-0 gap-1 sm:gap-0">
                          <span className="w-16 text-sm text-gray-300 flex-shrink-0 hidden sm:block">
                            {index === 0 ? year : ''}
                          </span>
                          <div className="flex-1 flex items-center gap-2">
                            <h3 className="text-base font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                              {item.title}
                            </h3>
                            {isNew(item.date) && (
                              <span className="text-xs text-pink-500 border border-pink-300 rounded-full px-2 py-0.5">New</span>
                            )}
                          </div>
                          <span className="text-sm text-gray-300 flex-shrink-0 sm:ml-8">
                            {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '/') : ''}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Now Playing & Contact - Desktop only, pinned to bottom */}
          <div className={`hidden md:block flex-shrink-0 mt-auto pt-4 transition-opacity overflow-visible ${hasSelection ? 'opacity-30' : ''}`}>
            <div className={`overflow-visible ${activeTab === 'illustration' ? 'w-full md:w-[calc(166%+1.5rem)]' : ''}`}>
              <NowPlayingContent data={nowPlayingData} />
            </div>

            {/* Contact */}
            <footer className="pt-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {/* Twitter */}
              <div className="relative inline-block">
                <a ref={(el) => { socialRefs.current.twitter = el; }} href={siteConfig.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors"
                  onMouseEnter={() => setHoveredSocial('twitter')}
                  onMouseLeave={() => { setHoveredSocial(null); setSocialMousePos({ x: 0, y: 0 }); }}
                  onMouseMove={(e) => { const ref = socialRefs.current.twitter; if (!ref) return; const rect = ref.getBoundingClientRect(); setSocialMousePos({ x: (e.clientX - rect.left - rect.width / 2) * 0.1, y: (e.clientY - rect.top - rect.height / 2) * 0.1 }); }}
                >Twitter</a>
                {hoveredSocial === 'twitter' && siteConfig.socialImages?.twitter && (
                  <div className="absolute bottom-full left-1/2 mb-3 z-50 transition-transform duration-75 ease-out pointer-events-none" style={{ transform: `translateX(-50%) translate(${socialMousePos.x}px, ${socialMousePos.y}px)` }}>
                    <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-100">
                      <Image src={siteConfig.socialImages.twitter} alt="Twitter preview" width={200} height={150} className="w-48 h-auto rounded" />
                    </div>
                  </div>
                )}
              </div>

              {/* GitHub */}
              <div className="relative inline-block">
                <a ref={githubRef} href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors"
                  onMouseEnter={() => setGithubHovered(true)}
                  onMouseLeave={() => { setGithubHovered(false); setGithubMousePos({ x: 0, y: 0 }); }}
                  onMouseMove={(e) => { if (!githubRef.current) return; const rect = githubRef.current.getBoundingClientRect(); setGithubMousePos({ x: (e.clientX - rect.left - rect.width / 2) * 0.1, y: (e.clientY - rect.top - rect.height / 2) * 0.1 }); }}
                >GitHub</a>
                {githubHovered && getGitHubUsername(siteConfig.social.github) && (
                  <div className="absolute bottom-full left-1/2 mb-3 z-50 transition-transform duration-75 ease-out pointer-events-none" style={{ transform: `translateX(-50%) translate(${githubMousePos.x}px, ${githubMousePos.y}px)` }}>
                    <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://ghchart.rshah.org/${getGitHubUsername(siteConfig.social.github)}`} alt="GitHub Contributions" className="w-64 h-auto" />
                    </div>
                  </div>
                )}
              </div>

              {/* LinkedIn */}
              <div className="relative inline-block">
                <a ref={(el) => { socialRefs.current.linkedin = el; }} href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors"
                  onMouseEnter={() => setHoveredSocial('linkedin')}
                  onMouseLeave={() => { setHoveredSocial(null); setSocialMousePos({ x: 0, y: 0 }); }}
                  onMouseMove={(e) => { const ref = socialRefs.current.linkedin; if (!ref) return; const rect = ref.getBoundingClientRect(); setSocialMousePos({ x: (e.clientX - rect.left - rect.width / 2) * 0.1, y: (e.clientY - rect.top - rect.height / 2) * 0.1 }); }}
                >LinkedIn</a>
                {hoveredSocial === 'linkedin' && siteConfig.socialImages?.linkedin && (
                  <div className="absolute bottom-full left-1/2 mb-3 z-50 transition-transform duration-75 ease-out pointer-events-none" style={{ transform: `translateX(-50%) translate(${socialMousePos.x}px, ${socialMousePos.y}px)` }}>
                    <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-100">
                      <Image src={siteConfig.socialImages.linkedin} alt="LinkedIn preview" width={200} height={150} className="w-48 h-auto rounded" />
                    </div>
                  </div>
                )}
              </div>

              {/* Behance */}
              <div className="relative inline-block">
                <a ref={(el) => { socialRefs.current.behance = el; }} href={siteConfig.social.behance} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors"
                  onMouseEnter={() => setHoveredSocial('behance')}
                  onMouseLeave={() => { setHoveredSocial(null); setSocialMousePos({ x: 0, y: 0 }); }}
                  onMouseMove={(e) => { const ref = socialRefs.current.behance; if (!ref) return; const rect = ref.getBoundingClientRect(); setSocialMousePos({ x: (e.clientX - rect.left - rect.width / 2) * 0.1, y: (e.clientY - rect.top - rect.height / 2) * 0.1 }); }}
                >Behance</a>
                {hoveredSocial === 'behance' && siteConfig.socialImages?.behance && (
                  <div className="absolute bottom-full left-1/2 mb-3 z-50 transition-transform duration-75 ease-out pointer-events-none" style={{ transform: `translateX(-50%) translate(${socialMousePos.x}px, ${socialMousePos.y}px)` }}>
                    <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-100">
                      <Image src={siteConfig.socialImages.behance} alt="Behance preview" width={200} height={150} className="w-48 h-auto rounded" />
                    </div>
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div className="relative inline-block">
                <a ref={(el) => { socialRefs.current.instagram = el; }} href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors"
                  onMouseEnter={() => setHoveredSocial('instagram')}
                  onMouseLeave={() => { setHoveredSocial(null); setSocialMousePos({ x: 0, y: 0 }); }}
                  onMouseMove={(e) => { const ref = socialRefs.current.instagram; if (!ref) return; const rect = ref.getBoundingClientRect(); setSocialMousePos({ x: (e.clientX - rect.left - rect.width / 2) * 0.1, y: (e.clientY - rect.top - rect.height / 2) * 0.1 }); }}
                >Instagram</a>
                {hoveredSocial === 'instagram' && siteConfig.socialImages?.instagram && (
                  <div className="absolute bottom-full left-1/2 mb-3 z-50 transition-transform duration-75 ease-out pointer-events-none" style={{ transform: `translateX(-50%) translate(${socialMousePos.x}px, ${socialMousePos.y}px)` }}>
                    <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-100">
                      <Image src={siteConfig.socialImages.instagram} alt="Instagram preview" width={200} height={150} className="w-48 h-auto rounded" />
                    </div>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="relative inline-block">
                <a ref={(el) => { socialRefs.current.email = el; }} href={`mailto:${siteConfig.social.email}`} className="text-gray-400 hover:text-gray-900 transition-colors"
                  onMouseEnter={() => setHoveredSocial('email')}
                  onMouseLeave={() => { setHoveredSocial(null); setSocialMousePos({ x: 0, y: 0 }); }}
                  onMouseMove={(e) => { const ref = socialRefs.current.email; if (!ref) return; const rect = ref.getBoundingClientRect(); setSocialMousePos({ x: (e.clientX - rect.left - rect.width / 2) * 0.1, y: (e.clientY - rect.top - rect.height / 2) * 0.1 }); }}
                >Email</a>
                {hoveredSocial === 'email' && siteConfig.socialImages?.email && (
                  <div className="absolute bottom-full left-1/2 mb-3 z-50 transition-transform duration-75 ease-out pointer-events-none" style={{ transform: `translateX(-50%) translate(${socialMousePos.x}px, ${socialMousePos.y}px)` }}>
                    <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-100">
                      <Image src={siteConfig.socialImages.email} alt="Email preview" width={200} height={150} className="w-48 h-auto rounded" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            </footer>
          </div>
        </div>

        {/* Right Column - Content Display (scrollable) */}
        <div className="hidden md:block md:col-span-8 relative h-full ml-[-50px]">
          {/* Top fade overlay */}
          <div className="absolute -top-8 left-[50px] right-4 h-12 bg-gradient-to-b from-background from-0% via-background/20 via-50% to-transparent to-100% z-10 pointer-events-none" />
          <CustomScrollbar
            className="absolute inset-0"
            position="left"
            thumbHeight={30}
            thumbWidth={2}
            contentClassName="pl-[50px]"
          >
          {selectedProject ? (
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
                  {selectedProject.blocks.map((block, index) => renderBlock(block, index))}
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
        </div>
      </div>

      {/* Mobile Bottom Section */}
      <div className="md:hidden mt-auto pt-6">
        <div className="flex flex-col gap-4">
          {/* Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {siteConfig.avatar ? (
                <Image
                  src={siteConfig.avatar}
                  alt={siteConfig.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-white">
                  {siteConfig.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">{siteConfig.name}</h1>
              <p className="text-sm text-gray-500">{siteConfig.title}</p>
            </div>
          </div>

          {/* Now Playing */}
          <div className="flex items-center gap-3">
            <NowPlayingImage data={nowPlayingData} />
            <div className="min-w-0">
              {nowPlayingData?.isPlaying ? (
                <>
                  <a href={nowPlayingData.songUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-900 hover:text-gray-600 transition-colors truncate block">
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

          {/* Social links */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <a href={siteConfig.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">Twitter</a>
            <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">GitHub</a>
            <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">LinkedIn</a>
            <a href={siteConfig.social.behance} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">Behance</a>
            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">Instagram</a>
            <a href={`mailto:${siteConfig.social.email}`} className="text-gray-400 hover:text-gray-900 transition-colors">Email</a>
          </div>
        </div>
      </div>

      {/* Hover Preview - Centered on screen */}
      {hoveredProject && projectImages.length > 0 && !selectedProject && (
        <div className="hidden md:flex fixed inset-0 items-center justify-center pointer-events-none z-10">
          <div className="relative w-[72vw] h-[72vh] transition-opacity duration-300">
            <Image
              key={projectImages[previewImageIndex]}
              src={projectImages[previewImageIndex]}
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
    </div>
  );
}
