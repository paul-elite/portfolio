'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  projects,
  writings,
  illustrations,
  interactions,
  siteConfig,
  Project,
} from '@/lib/data';

type Tab = 'projects' | 'interaction' | 'illustration' | 'writings';

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<Tab>('projects');
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'projects', label: 'Projects' },
    { key: 'interaction', label: 'Interaction' },
    { key: 'illustration', label: 'Illustration' },
    { key: 'writings', label: 'Writings' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1">
        {/* Hero Section */}
        <section className="pt-16 pb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden flex items-center justify-center">
              <span className="text-lg font-medium text-gray-500">
                {siteConfig.name.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {siteConfig.name}
              </h1>
              <p className="text-sm text-gray-500">{siteConfig.title}</p>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm py-6">
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

        {/* Content Section */}
        <section className="relative">
          {/* Preview Panel */}
          <div
            className={`fixed right-8 top-1/2 -translate-y-1/2 w-72 h-48 bg-gray-100 rounded-lg overflow-hidden transition-opacity duration-200 ${
              hoveredProject ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {hoveredProject && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                {hoveredProject.title}
              </div>
            )}
          </div>

          {activeTab === 'projects' && (
            <div>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/project/${project.slug}`}
                  className="group block py-4"
                  onMouseEnter={() => setHoveredProject(project)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  <h2 className="text-base font-medium text-gray-900 mb-1 group-hover:text-gray-600 transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {project.year} <span className="mx-1">·</span> {project.description}
                  </p>
                </Link>
              ))}
            </div>
          )}

          {activeTab === 'interaction' && (
            <div>
              {interactions.map((item) => (
                <article key={item.id} className="py-4">
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'illustration' && (
            <div>
              {illustrations.map((item) => (
                <article key={item.id} className="py-4">
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          )}

          {activeTab === 'writings' && (
            <div>
              {writings.map((item) => (
                <article key={item.id} className="py-4">
                  <h3 className="text-base font-medium text-gray-900 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Contact Section - Fixed at bottom */}
      <footer className="py-8 mt-auto">
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
  );
}
