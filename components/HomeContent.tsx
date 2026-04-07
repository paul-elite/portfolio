'use client';

import { useState } from 'react';
import WorkCard from './WorkCard';
import {
  workCategories,
  writings,
  illustrations,
  interactions,
  siteConfig,
} from '@/lib/data';

type Tab = 'projects' | 'interaction' | 'illustration' | 'writings';

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState<Tab>('projects');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'projects', label: 'Projects' },
    { key: 'interaction', label: 'Interaction' },
    { key: 'illustration', label: 'Illustration' },
    { key: 'writings', label: 'Writings' },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="pt-12 pb-24">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden flex items-center justify-center -ml-16 mr-4">
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
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2">
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
      <section>
        {activeTab === 'projects' && (
          <div>
            {workCategories.map((category, index) => (
              <WorkCard key={category.slug} category={category} index={index} />
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

      {/* Contact Section */}
      <section className="py-12">
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
      </section>
    </>
  );
}
