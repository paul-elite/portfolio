'use client';

import { Project } from '@/lib/data';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <article
      className="group py-6"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div>
        <h3 className="text-base font-medium text-gray-900 mb-1 group-hover:text-gray-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {project.description}
        </p>
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
