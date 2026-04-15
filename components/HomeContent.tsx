'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import OptimizedImage from './OptimizedImage';
import { Project, Illustration } from '@/lib/data';
import { useNowPlaying, NowPlayingContent, NowPlayingImage } from './NowPlaying';

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
  bio: string;
  social: {
    twitter: string;
    github: string;
    linkedin: string;
    email: string;
    behance: string;
    instagram: string;
  };
}

interface ContentData {
  projects: Project[];
  writings: { id: string; slug: string; title: string; description: string; cover?: string; date?: string }[];
  illustrations: Illustration[];
  interactions: { id: string; slug: string; title: string; description: string }[];
}

interface HomeContentProps {
  initialConfig: SiteConfig;
  initialContent: ContentData;
}

type Tab = 'projects' | 'interaction' | 'illustration' | 'writings';

export default function HomeContent({ initialConfig, initialContent }: HomeContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [activeVideo, setActiveVideo] = useState<Illustration | null>(null);
  const [playingInlineId, setPlayingInlineId] = useState<string | null>(null);
  const [illustrationPage, setIllustrationPage] = useState(0);
  const [githubHovered, setGithubHovered] = useState(false);
  const [githubMousePos, setGithubMousePos] = useState({ x: 0, y: 0 });
  const [showMoreTabs, setShowMoreTabs] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const githubRef = useRef<HTMLAnchorElement>(null);
  const nowPlayingData = useNowPlaying();

  const siteConfig = initialConfig;
  const content = initialContent;

  // Get preview images from the hovered project
  // Use previewImages if available, otherwise fall back to extracting from blocks
  const projectImages = useMemo(() => {
    if (!hoveredProject) return [];
    // Use dedicated previewImages array if available
    if (hoveredProject.previewImages && hoveredProject.previewImages.length > 0) {
      return hoveredProject.previewImages;
    }
    // Fallback: extract images from blocks
    if (hoveredProject.blocks) {
      return hoveredProject.blocks
        .filter((block) => block.type === 'image')
        .map((block) => block.content);
    }
    return [];
  }, [hoveredProject]);

  // Cycle through project images
  useEffect(() => {
    if (!hoveredProject || projectImages.length <= 1) {
      setPreviewImageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setPreviewImageIndex((prev) => (prev + 1) % projectImages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [hoveredProject, projectImages.length]);

  const mainTabs: { key: Tab; label: string }[] = [
    { key: 'projects', label: 'Projects' },
    { key: 'illustration', label: 'Illustration' },
    { key: 'writings', label: 'Writings' },
  ];

  const moreTabs: { key: Tab; label: string }[] = [
    { key: 'interaction', label: 'Interaction' },
  ];

  return (
    <div className="min-h-screen flex flex-col pt-16 pb-4 md:pt-32 md:pb-16 pl-2 pr-3 md:px-0">
      {/* Main content area */}
      <div className="flex-1 flex md:grid md:grid-cols-12 gap-4 md:gap-6">
        {/* Columns 1-2: Whitespace (desktop only) */}
        <div className="hidden md:block md:col-span-2" />

        {/* Avatar - 12px from edge on mobile */}
        <div className="flex-shrink-0 md:col-span-1 md:flex md:justify-end md:items-start">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
            {siteConfig.avatar ? (
              <Image
                src={siteConfig.avatar}
                alt={siteConfig.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-gray-500">
                {siteConfig.name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 md:col-span-3 flex flex-col min-w-0">
          {/* Name */}
          <div className="h-auto md:h-14 mb-6 md:mb-4">
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
                className={`transition-colors font-normal ${
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
                onClick={() => setActiveTab(tab.key)}
                className={`transition-colors font-normal ${
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
              className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
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

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'projects' && (
              <div>
                {content.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/project/${project.slug}`}
                    className="group block py-3"
                    onMouseEnter={() => setHoveredProject(project)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <h2 className="text-base font-normal text-gray-900 mb-0.5 group-hover:text-gray-600 transition-colors">
                      {project.title}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {project.year} <span className="mx-1">·</span> {project.description}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === 'interaction' && (
              <div>
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

            {activeTab === 'illustration' && (() => {
              const itemsPerPage = 4;
              const totalPages = Math.ceil(content.illustrations.length / itemsPerPage);
              const startIndex = illustrationPage * itemsPerPage;
              const currentItems = content.illustrations.slice(startIndex, startIndex + itemsPerPage);

              const handleWheel = (e: React.WheelEvent) => {
                e.preventDefault();
                if (e.deltaY > 0 && illustrationPage < totalPages - 1) {
                  setIllustrationPage(illustrationPage + 1);
                } else if (e.deltaY < 0 && illustrationPage > 0) {
                  setIllustrationPage(illustrationPage - 1);
                }
              };

              return (
                <div
                  className="flex gap-6 h-full items-center w-full md:w-[calc(166%+1.5rem)]"
                  onWheel={handleWheel}
                >
                  {/* 2x2 Grid (1 col on mobile, 2 on desktop) */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-4 content-center">
                    {currentItems.map((item) => {
                      const isPlayingInline = playingInlineId === item.id;
                      const youtubeId = item.youtubeUrl ? getYouTubeId(item.youtubeUrl) : null;

                      return (
                        <div key={item.id} className="group block">
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
                            {isPlayingInline && youtubeId ? (
                              // Inline video player
                              <>
                                <iframe
                                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                                {/* Expand button overlay when playing */}
                                <button
                                  onClick={() => {
                                    setActiveVideo(item);
                                    setPlayingInlineId(null);
                                  }}
                                  className="absolute bottom-2 right-2 text-xs px-2 py-1 bg-white/90 rounded transition-colors hover:bg-white"
                                  style={{ color: '#0066f5' }}
                                >
                                  Expand
                                </button>
                              </>
                            ) : (
                              // Thumbnail with hover overlay
                              <button
                                onClick={() => {
                                  if (youtubeId) {
                                    setPlayingInlineId(item.id);
                                  }
                                }}
                                className="w-full h-full relative cursor-pointer"
                              >
                                {item.thumbnail ? (
                                  <OptimizedImage
                                    src={item.thumbnail}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 100vw, 50vw"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-gray-300 text-xs">{item.title}</span>
                                  </div>
                                )}
                                {/* Hover overlay with title and play button */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                                  <h3 className="text-sm text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity text-center px-4">
                                    {item.title}
                                  </h3>
                                  {youtubeId && (
                                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                                      <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="text-gray-900 ml-0.5"
                                      >
                                        <polygon points="5 3 19 12 5 21 5 3" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Vertical Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col justify-center gap-3">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setIllustrationPage(i);
                          }}
                          className="w-4 h-8 flex items-center justify-center cursor-pointer"
                          aria-label={`Page ${i + 1}`}
                        >
                          <span
                            className={`w-1 h-6 rounded-full transition-colors ${
                              illustrationPage === i ? 'bg-gray-900' : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === 'writings' && (() => {
              // Group writings by year
              const writingsByYear = content.writings.reduce((acc, item) => {
                const year = item.date ? new Date(item.date).getFullYear().toString() : 'Unknown';
                if (!acc[year]) acc[year] = [];
                acc[year].push(item);
                return acc;
              }, {} as Record<string, typeof content.writings>);

              // Sort years descending
              const sortedYears = Object.keys(writingsByYear).sort((a, b) => Number(b) - Number(a));

              // Check if item is less than 30 days old
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
                      {writingsByYear[year].map((item, index) => (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-baseline py-3 border-b border-gray-100 last:border-0 gap-1 sm:gap-0">
                          <span className="w-16 text-sm text-gray-300 flex-shrink-0 hidden sm:block">
                            {index === 0 ? year : ''}
                          </span>
                          <div className="flex-1 flex items-center gap-2">
                            <h3 className="text-base font-medium text-gray-900">
                              {item.title}
                            </h3>
                            {isNew(item.date) && (
                              <span className="text-xs text-pink-500 border border-pink-300 rounded-full px-2 py-0.5">
                                New
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-300 flex-shrink-0">
                            {item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }).replace('/', '/') : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Now Playing - Desktop only (uses negative margin) */}
          <div className={`hidden md:block ${activeTab === 'illustration' ? 'w-full md:w-[calc(166%+1.5rem)]' : ''}`}>
            <NowPlayingContent data={nowPlayingData} />
          </div>

          {/* Contact - Desktop only (mobile shows in bottom section) */}
          <footer className="hidden md:block pt-4">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                Twitter
              </a>
              <div className="relative inline-block">
                <a
                  ref={githubRef}
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                  onMouseEnter={() => setGithubHovered(true)}
                  onMouseLeave={() => {
                    setGithubHovered(false);
                    setGithubMousePos({ x: 0, y: 0 });
                  }}
                  onMouseMove={(e) => {
                    if (!githubRef.current) return;
                    const rect = githubRef.current.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    const offsetX = (e.clientX - centerX) * 0.1;
                    const offsetY = (e.clientY - centerY) * 0.1;
                    setGithubMousePos({ x: offsetX, y: offsetY });
                  }}
                >
                  GitHub
                </a>
                {githubHovered && getGitHubUsername(siteConfig.social.github) && (
                  <div
                    className="absolute bottom-full left-1/2 mb-3 z-50 transition-transform duration-75 ease-out"
                    style={{
                      transform: `translateX(-50%) translate(${githubMousePos.x}px, ${githubMousePos.y}px)`,
                    }}
                  >
                    <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://ghchart.rshah.org/${getGitHubUsername(siteConfig.social.github)}`}
                        alt="GitHub Contributions"
                        className="w-64 h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href={siteConfig.social.behance}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                Behance
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                Instagram
              </a>
              <a
                href={`mailto:${siteConfig.social.email}`}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                Email
              </a>
            </div>
          </footer>
        </div>

        {/* Column 7: Gap (desktop only) */}
        <div className="hidden md:block md:col-span-1" />

        {/* Columns 8-10: Project Images Preview (desktop only) */}
        <div className="hidden md:flex md:col-span-3 items-stretch">
          <div
            className={`transition-opacity duration-300 w-full h-full ${
              hoveredProject && projectImages.length > 0 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {hoveredProject && projectImages.length > 0 && (
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                <Image
                  key={projectImages[previewImageIndex]}
                  src={projectImages[previewImageIndex]}
                  alt={hoveredProject.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
            )}
          </div>
        </div>

        {/* Columns 11-12: Whitespace (desktop only) */}
        <div className="hidden md:block md:col-span-2" />
      </div>

      {/* Mobile Bottom Section - Now Playing & Contacts */}
      <div className="md:hidden mt-auto pt-6">
        <div className="flex gap-4">
          {/* Music Icon */}
          <div className="flex-shrink-0">
            <NowPlayingImage data={nowPlayingData} />
          </div>
          {/* Now Playing Text & Contacts */}
          <div className="flex-1 min-w-0">
            {nowPlayingData?.isPlaying ? (
              <>
                <a
                  href={nowPlayingData.songUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-900 hover:text-gray-600 transition-colors truncate block"
                >
                  {nowPlayingData.title}
                </a>
                <p className="text-sm text-gray-400 truncate">{nowPlayingData.artist}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-900">Not listening right now</p>
                {nowPlayingData?.lastPlayed ? (
                  <p className="text-sm text-gray-400 truncate">
                    last: {nowPlayingData.lastPlayed.title}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">check again shortly</p>
                )}
              </>
            )}
            {/* Contact Links */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm mt-4">
              <a href={siteConfig.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">Twitter</a>
              <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">GitHub</a>
              <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">LinkedIn</a>
              <a href={siteConfig.social.behance} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">Behance</a>
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">Instagram</a>
              <a href={`mailto:${siteConfig.social.email}`} className="text-gray-400 hover:text-gray-900 transition-colors">Email</a>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && activeVideo.youtubeUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(activeVideo.youtubeUrl)}?autoplay=1`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
