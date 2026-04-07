import WorkCard from '@/components/WorkCard';
import { siteConfig, workCategories } from '@/lib/data';

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-white pt-12 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Hero Section */}
          <section className="py-12">
            <div className="flex items-start justify-between gap-8 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-500">
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
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                <span>Projects</span>
                <span>Interaction</span>
                <span>Illustration</span>
                <span>Writings</span>
              </div>
            </div>
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              {siteConfig.bio}
            </p>
          </section>

          {/* Work Section */}
          <section className="py-8">
            <div>
              {workCategories.map((category, index) => (
                <WorkCard key={category.slug} category={category} index={index} />
              ))}
            </div>
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
        </div>
      </main>
    </>
  );
}
