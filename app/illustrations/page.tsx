import Link from 'next/link';
import { illustrations } from '@/lib/data';

export default function IllustrationsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-2xl font-semibold text-gray-900">Illustrations</h1>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors"
          >
            ← Back
          </Link>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-2 gap-6">
          {illustrations.map((item) => (
            <div key={item.id} className="group">
              {/* Preview */}
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-300 text-sm">{item.title}</span>
                </div>

                {/* Play Button Overlay */}
                {item.youtubeUrl && (
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="text-gray-900 ml-1"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </a>
                )}
              </div>

              {/* Info */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-medium text-gray-900 mb-1">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>

                {item.youtubeUrl && (
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-sm text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Watch
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
