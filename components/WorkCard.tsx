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
      className="group block py-4"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div>
        <h2 className="text-base font-medium text-gray-900 mb-1 group-hover:text-gray-600 transition-colors">
          {category.title}
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xl">
          {category.description}
        </p>
      </div>
    </Link>
  );
}
