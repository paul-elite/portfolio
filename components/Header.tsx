'use client';

import Link from 'next/link';
import { siteConfig } from '@/lib/data';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-4">
        <Link href="/" className="flex items-center gap-3 w-fit group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
            {/* Placeholder avatar - replace with actual image */}
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">
              {siteConfig.name.charAt(0)}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-900 group-hover:text-gray-600 transition-colors">
            {siteConfig.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
