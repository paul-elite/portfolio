'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project, siteConfig } from '@/lib/data';
import { useTransition } from '@/components/PageTransition';

interface ProjectContentProps {
  project: Project;
}

export default function ProjectContent({ project }: ProjectContentProps) {
  const { setSelectedProject } = useTransition();

  useEffect(() => {
    setSelectedProject(null);
  }, [setSelectedProject]);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-24">
        {/* Back + Avatar */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              layoutId="avatar"
            >
              <span className="text-sm font-medium text-gray-500">
                {siteConfig.name.charAt(0)}
              </span>
            </motion.div>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back
          </Link>
        </div>

        {/* Project Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.h1
            className="text-2xl font-semibold text-gray-900 mb-2"
            layoutId="page-title"
          >
            {project.title}
          </motion.h1>

          <div className="flex gap-4 text-sm text-gray-400 mb-12">
            {project.year && <span>{project.year}</span>}
            {project.role && <span>{project.role}</span>}
          </div>
        </motion.div>

        {/* Mobile Mockup */}
        <motion.div
          className="mb-16 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="relative w-[266px] h-[560px] bg-gray-900 rounded-[48px] p-3 shadow-xl">
            <div className="w-full h-full bg-gray-100 rounded-[38px] overflow-hidden flex items-center justify-center">
              <span className="text-gray-400 text-sm text-center px-6">
                {project.title}
              </span>
            </div>
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-6 bg-gray-900 rounded-full" />
          </div>
        </motion.div>

        {/* Case Study Content */}
        {project.caseStudy && (
          <motion.div
            className="space-y-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <section>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                Overview
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                {project.caseStudy.overview}
              </p>
            </section>

            <section>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                Challenge
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                {project.caseStudy.challenge}
              </p>
            </section>

            <section>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                Approach
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                {project.caseStudy.approach}
              </p>
            </section>

            <section>
              <h2 className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                Outcome
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                {project.caseStudy.outcome}
              </p>
            </section>
          </motion.div>
        )}

        {/* Link */}
        {project.link && (
          <motion.a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-gray-900 transition-colors mt-12 inline-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            View Project →
          </motion.a>
        )}
      </div>
    </main>
  );
}
