'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Illustration } from '@/lib/data';

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}
import {
  projects,
  writings,
  illustrations,
  interactions,
  siteConfig,
  Project,
} from '@/lib/data';
import { useNowPlaying, NowPlayingImage, NowPlayingText } from './NowPlaying';

type Tab = 'projects' | 'interaction' | 'illustration' | 'writings';

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [activeVideo, setActiveVideo] = useState<Illustration | null>(null);
  const nowPlayingData = useNowPlaying();

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
                {projects.map((project) => (
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
                {interactions.map((item) => (
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
              <div className="grid grid-cols-2 gap-4" style={{ width: 'calc(166% + 1.5rem)' }}>
                {illustrations.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveVideo(item)}
                    className="group block text-left"
                  >
                    <div className="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden relative">
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
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
                      {item.title}
                    </h3>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'writings' && (
              <div>
                {writings.map((item) => (
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
          </div>

          {/* Now Playing - aligned with avatar */}
          <div className="flex items-center py-4" style={{ marginLeft: 'calc(-33.333% - 1.5rem)' }}>
            <div className="flex justify-end pr-3" style={{ width: 'calc(33.333% + 1.5rem)' }}>
              <NowPlayingImage data={nowPlayingData} />
            </div>
            <div className="min-w-0 flex-1">
              <NowPlayingText data={nowPlayingData} />
            </div>
          </div>

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
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                GitHub
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                LinkedIn
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
