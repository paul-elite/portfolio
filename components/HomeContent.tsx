'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project, Illustration } from '@/lib/data';
import { useNowPlaying, NowPlayingContent } from './NowPlaying';

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
  const githubRef = useRef<HTMLAnchorElement>(null);
  const nowPlayingData = useNowPlaying();

  const siteConfig = initialConfig;
  const content = initialContent;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'projects', label: 'Projects' },
    { key: 'interaction', label: 'Interaction' },
    { key: 'illustration', label: 'Illustration' },
    { key: 'writings', label: 'Writings' },
  ];

  return (
    <div className="h-screen pt-48 pb-16">
      <div className="h-full grid grid-cols-12 gap-6">
        {/* Columns 1-2: Whitespace */}
        <div className="col-span-2" />

        {/* Column 3: Avatar */}
        <div className="col-span-1 flex justify-end items-start">
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

        {/* Columns 4-6: Text Content */}
        <div className="col-span-3 flex flex-col">
          {/* Name */}
          <div className="h-14 mb-6">
            <h1 className="text-xl font-semibold text-gray-900">
              {siteConfig.name}
            </h1>
            <p className="text-sm text-gray-500">{siteConfig.title}</p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`transition-colors ${
                  activeTab === tab.key
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
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
                    <h2 className="text-base font-medium text-gray-900 mb-0.5 group-hover:text-gray-600 transition-colors">
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
                  className="flex gap-6 h-full min-h-[300px]"
                  style={{ width: 'calc(166% + 1.5rem)' }}
                  onWheel={handleWheel}
                >
                  {/* 2x2 Grid */}
                  <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 content-start">
                    {currentItems.map((item) => {
                      const isPlayingInline = playingInlineId === item.id;
                      const youtubeId = item.youtubeUrl ? getYouTubeId(item.youtubeUrl) : null;

                      return (
                        <div key={item.id} className="group block text-left">
                          <div className="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden relative">
                            {isPlayingInline && youtubeId ? (
                              // Inline video player
                              <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              // Thumbnail with play button
                              <button
                                onClick={() => {
                                  if (youtubeId) {
                                    setPlayingInlineId(item.id);
                                  }
                                }}
                                className="w-full h-full relative cursor-pointer"
                              >
                                {item.thumbnail ? (
                                  <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-gray-300 text-xs">{item.title}</span>
                                  </div>
                                )}
                                {youtubeId && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                                  </div>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm text-gray-900 group-hover:text-gray-600 transition-colors">
                              {item.title}
                            </h3>
                            {isPlayingInline && (
                              <button
                                onClick={() => {
                                  setActiveVideo(item);
                                  setPlayingInlineId(null);
                                }}
                                className="text-xs transition-colors hover:opacity-80"
                                style={{ color: '#0066f5' }}
                              >
                                Expand
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
                        <div key={item.id} className="flex items-baseline py-3 border-b border-gray-100 last:border-0">
                          <span className="w-16 text-sm text-gray-300 flex-shrink-0">
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

          {/* Now Playing */}
          <div style={activeTab === 'illustration' ? { width: 'calc(166% + 1.5rem)' } : undefined}>
            <NowPlayingContent data={nowPlayingData} />

            {/* Contact */}
            <footer className="pt-4">
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
        </div>

        {/* Column 7: Gap */}
        <div className="col-span-1" />

        {/* Columns 8-10: Mobile Preview */}
        <div className="col-span-3 flex items-start">
          <div
            className={`transition-opacity duration-200 ${
              hoveredProject ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Mobile Phone Mockup */}
            <div className="relative w-[266px] h-[560px] bg-gray-900 rounded-[48px] p-3 shadow-xl">
              {/* Screen */}
              <div className="w-full h-full bg-gray-100 rounded-[38px] overflow-hidden flex items-center justify-center">
                {hoveredProject && hoveredProject.preview ? (
                  <Image
                    src={hoveredProject.preview}
                    alt={hoveredProject.title}
                    fill
                    className="object-cover"
                  />
                ) : hoveredProject ? (
                  <span className="text-gray-400 text-sm text-center px-6">
                    {hoveredProject.title}
                  </span>
                ) : null}
              </div>
              {/* Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-full" />
            </div>
          </div>
        </div>

        {/* Columns 11-12: Whitespace */}
        <div className="col-span-2" />
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
