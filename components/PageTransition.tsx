'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface TransitionContextType {
  selectedProject: { slug: string; title: string } | null;
  setSelectedProject: (project: { slug: string; title: string } | null) => void;
  isTransitioning: boolean;
  startTransition: (project: { slug: string; title: string }) => void;
}

const TransitionContext = createContext<TransitionContextType | null>(null);

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within TransitionProvider');
  }
  return context;
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const [selectedProject, setSelectedProject] = useState<{ slug: string; title: string } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  const startTransition = (project: { slug: string; title: string }) => {
    setSelectedProject(project);
    setIsTransitioning(true);

    setTimeout(() => {
      router.push(`/project/${project.slug}`);
    }, 300);
  };

  return (
    <TransitionContext.Provider
      value={{ selectedProject, setSelectedProject, isTransitioning, startTransition }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function TransitionOverlay() {
  const { selectedProject, isTransitioning } = useTransition();

  return (
    <AnimatePresence>
      {isTransitioning && selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white flex items-start pt-48 px-6"
        >
          <div className="w-full grid grid-cols-12 gap-6">
            <div className="col-span-2" />
            <div className="col-span-1" />
            <div className="col-span-3">
              <motion.h1
                layoutId={`title-${selectedProject.slug}`}
                className="text-xl font-semibold text-gray-900"
              >
                {selectedProject.title}
              </motion.h1>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
