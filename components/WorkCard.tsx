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
      className="group block py-8"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div>
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
    </Link>
  );
}
