'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import OptimizedImage from './OptimizedImage';
import ContentBlocks from './content/ContentBlocks';
import type { Illustration, IllustrationCategory, PortfolioContent, Project, SiteConfig, Writing } from '@/lib/content-model';
import {
  ILLUSTRATION_CATEGORIES,
  MAIN_PORTFOLIO_TABS,
  SECONDARY_PORTFOLIO_TABS,
  type PortfolioTab,
} from '@/lib/portfolio-options';
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

interface HomeContentProps {
  initialConfig: SiteConfig;
  initialContent: PortfolioContent;
}

export default function HomeContent({ initialConfig, initialContent }: HomeContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PortfolioTab>('projects');
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedWriting, setSelectedWriting] = useState<Writing | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<IllustrationCategory | null>(null);
  const [activeVideo, setActiveVideo] = useState<Illustration | null>(null);
  const [githubHovered, setGithubHovered] = useState(false);
  const [githubMousePos, setGithubMousePos] = useState({ x: 0, y: 0 });
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);
  const [socialMousePos, setSocialMousePos] = useState({ x: 0, y: 0 });
  const [contentAnimationKey, setContentAnimationKey] = useState<string | null>(null);
  const githubRef = useRef<HTMLAnchorElement>(null);
  const socialRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const avatarContainerRef = useRef<HTMLDivElement>(null);
  const contentListRef = useRef<HTMLDivElement>(null);
  const [contentListReady, setContentListReady] = useState(false);
  const nowPlayingData = useNowPlaying();

  const siteConfig = initialConfig;
  const content = initialContent;

  // Callback ref handler for contentListRef that triggers state update
  const handleContentListRef = useCallback((el: HTMLDivElement | null) => {
    (contentListRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    setContentListReady(!!el);
  }, []);

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
  const updateURL = useCallback((selection: {
    projectSlug?: string | null;
    writingSlug?: string | null;
    category?: IllustrationCategory | null;
  }) => {
    const params = new URLSearchParams();
    if (selection.projectSlug) {
      params.set('project', selection.projectSlug);
    } else if (selection.writingSlug) {
      params.set('writing', selection.writingSlug);
    } else if (selection.category) {
      params.set('category', selection.category);
    }
    const newURL = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newURL, { scroll: false });
  }, [router]);

  // Wrapper functions to update selection and URL together
  const handleSelectProject = useCallback((project: Project | null) => {
    setSelectedProject(project);
    setSelectedWriting(null);
    setSelectedCategory(null);
    setPreviewImageIndex(0);
    setContentAnimationKey(project ? `project-${project.id}-${Date.now()}` : null);
    updateURL({ projectSlug: project?.slug || null });
  }, [updateURL]);

  const handleSelectWriting = useCallback((writing: Writing | null) => {
    setSelectedWriting(writing);
    setSelectedProject(null);
    setSelectedCategory(null);
    setHoveredProject(null);
    setPreviewImageIndex(0);
    setContentAnimationKey(writing ? `writing-${writing.id}-${Date.now()}` : null);
    updateURL({ writingSlug: writing?.slug || null });
  }, [updateURL]);

  const handleSelectCategory = useCallback((category: IllustrationCategory | null) => {
    setSelectedCategory(category);
    setSelectedProject(null);
    setSelectedWriting(null);
    setContentAnimationKey(category ? `category-${category}-${Date.now()}` : null);
    updateURL({ category });
  }, [updateURL]);

  const handleClearSelection = useCallback(() => {
    setSelectedProject(null);
    setSelectedWriting(null);
    setSelectedCategory(null);
    setContentAnimationKey(null);
    updateURL({});
  }, [updateURL]);

  const handleTabChange = useCallback((tab: PortfolioTab) => {
    setActiveTab(tab);
    setSelectedProject(null);
    setSelectedWriting(null);
    setSelectedCategory(null);
    setHoveredProject(null);
    setPreviewImageIndex(0);
    setContentAnimationKey(null);
    updateURL({});
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
    if (selectedProject || !hoveredProject || projectImages.length <= 1) return;

    const interval = setInterval(() => {
      setPreviewImageIndex((prev) => (prev + 1) % projectImages.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [hoveredProject, projectImages.length, selectedProject]);

  // Calculate avatar position based on project index
  const targetProject = selectedProject || hoveredProject;
  const targetProjectIndex = targetProject
    ? content.projects.findIndex(p => p.id === targetProject.id)
    : -1;

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
  const hasSelection = selectedProject !== null || selectedWriting !== null || selectedCategory !== null;

  const moreTabs = SECONDARY_PORTFOLIO_TABS;
  const selectedDetailContent = selectedProject ? (
    <div key={contentAnimationKey} className="w-full max-w-[572px] animate-slideInFromRight">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{selectedProject.title}</h2>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mb-6">
        {selectedProject.year && <span>{selectedProject.year}</span>}
        {selectedProject.role && <span>{selectedProject.role}</span>}
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
  ) : selectedCategory ? (
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

  return (
    <div className="portfolio-home h-screen flex flex-col pt-16 pb-4 md:pt-32 md:pb-8 pl-2 pr-3 md:px-6">
      {/* Main content area */}
      <div className="flex-1 flex md:grid md:grid-cols-12 gap-4 md:gap-6 min-h-0 overflow-visible">
        {/* Avatar Column */}
        <div className="hidden md:flex md:col-span-1 flex-col items-end h-full overflow-visible">
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

          {/* Tabs spacer - matches exact height of tabs section using same elements */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-base mb-6 opacity-0 pointer-events-none" aria-hidden="true">
            {mainTabs.map((tab) => (
              <button key={tab.key} type="button" className="font-normal">{tab.label}</button>
            ))}
            {showMoreTabs && moreTabs.map((tab) => (
              <button key={tab.key} type="button" className="font-normal">{tab.label}</button>
            ))}
            <button type="button" className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="6" y1="2" x2="6" y2="10" />
                <line x1="2" y1="6" x2="10" y2="6" />
              </svg>
            </button>
          </div>

          {/* Project Avatars - synced with content list scroll */}
          <div className="flex-1 min-h-0 relative">
            <div ref={avatarContainerRef} className="absolute inset-0 overflow-y-auto hide-scrollbar">
            {activeTab === 'projects' && content.projects.map((project, index) => {
              const isActive = targetProjectIndex === index;
              const colors = [
                'from-blue-400 to-cyan-400',
                'from-purple-400 to-pink-400',
                'from-orange-400 to-red-400',
                'from-green-400 to-teal-400',
                'from-indigo-400 to-purple-400',
                'from-pink-400 to-rose-400',
              ];
              const colorClass = colors[index % colors.length];

              return (
                <div
                  key={project.id}
                  className="py-3 h-[60px] flex items-center justify-end"
                >
                  <div
                    className={`flex-shrink-0 transition-all duration-150 ${
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    }`}
                  >
                    {project.avatar ? (
                      <Image
                        src={project.avatar}
                        alt={project.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                        <span className="text-sm font-medium text-white">
                          {project.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                    <span className="text-base">{cat.symbol}</span>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Left Content Column - Fixed at 100vh */}
        <div className="flex-1 md:col-span-3 flex flex-col min-w-0 h-full overflow-visible">
          {/* Identity */}
          <div className={`hidden md:block h-auto md:h-14 mb-6 md:mb-4 transition-opacity ${hasSelection ? 'opacity-60' : ''}`}>
            <h1 className="text-base font-semibold text-gray-900">
              {siteConfig.name}
            </h1>
            <p className="text-base font-normal text-gray-500">{siteConfig.title}</p>
          </div>
          <div className={`md:hidden mb-6 transition-opacity ${hasSelection ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearSelection}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 overflow-hidden"
                aria-label="Show all work"
              >
                {(() => {
                  const avatarSrc = hasSelection && siteConfig.avatarFocused ? siteConfig.avatarFocused : siteConfig.avatar;
                  return avatarSrc ? (
                    <Image
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

          {/* Tabs */}
          <div className="ml-[52px] md:ml-0 flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-1 text-[15px] md:text-base mb-6">
            {mainTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`transition-all font-normal ${
                  activeTab === tab.key
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
            {showMoreTabs && moreTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`transition-all font-normal ${
                  activeTab === tab.key
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => setShowMoreTabs(!showMoreTabs)}
              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-all"
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
          <CustomScrollbar
            className="flex-1 min-h-0"
            position="right"
            thumbHeight={30}
            thumbWidth={2}
            contentClassName="pl-[52px] md:pl-0"
            contentRef={contentListRef}
            onContentRefChange={handleContentListRef}
          >
            {hasSelection && selectedDetailContent && (
              <div className="md:hidden pb-8">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  aria-label="Back to list"
                  className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <span aria-hidden="true">←</span>
                  Back to list
                </button>
                {selectedDetailContent}
              </div>
            )}

            <div className={hasSelection ? 'hidden md:block' : ''}>
            {activeTab === 'projects' && content.projects.map((project) => {
              const isSelected = selectedProject?.id === project.id;
              return (
                <button
                  key={project.id}
                  onClick={() => handleSelectProject(isSelected ? null : project)}
                  className={`group block py-3 w-full text-left transition-opacity ${hasSelection && !isSelected ? 'opacity-30' : ''}`}
                  onMouseEnter={() => {
                    if (!selectedProject) {
                      setPreviewImageIndex(0);
                      setHoveredProject(project);
                    }
                  }}
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

          {/* Now Playing & Contact - Desktop only, pinned to bottom */}
          <div className={`hidden md:block flex-shrink-0 mt-auto pt-4 transition-opacity overflow-visible z-50 ${hasSelection ? 'opacity-30' : ''}`}>
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
      <div className={`md:hidden mt-auto pt-6 ${hasSelection ? 'hidden' : ''}`}>
        <div className="flex flex-col gap-4">
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
          <div className="pl-[52px] flex flex-wrap gap-x-4 gap-y-2 text-sm">
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
    </div>
  );
}
