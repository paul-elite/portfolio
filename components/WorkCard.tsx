'use client';

import Link from 'next/link';
import { WorkCategory } from '@/lib/data';

interface WorkCardProps {
  category: WorkCategory;
  index: number;
}

export default function WorkCard({ category, index }: WorkCardProps) {
  return (
    <Link
      href={`/work/${category.slug}`}
      className="group block py-8 border-b border-gray-100 last:border-b-0"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <span className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
            {category.discipline}
          </span>
          <h2 className="text-xl font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
            {category.title}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
            {category.description}
          </p>
          <span className="inline-block mt-4 text-sm text-gray-400">
            {category.projects.length} project{category.projects.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
