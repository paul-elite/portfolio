'use client';

import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import type { Project } from '@/lib/content-model';
import { PROJECT_AVATAR_OFFSET } from './PortfolioLayout';

interface ProjectBrowserProps {
  projects: Project[];
  selectedProject: Project | null;
  hasSelection: boolean;
  onSelect: (project: Project | null) => void;
  onHover: (project: Project | null) => void;
}

function ProjectButton({
  project,
  dimmed,
  onSelect,
  onHover,
  children,
  className,
  style,
}: {
  project: Project;
  dimmed: boolean;
  onSelect: () => void;
  onHover: (project: Project | null) => void;
  children: ReactNode;
  className: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${className} transition-all duration-[var(--experience-motion)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--experience-accent)] ${dimmed ? 'opacity-30' : ''}`}
      onMouseEnter={() => onHover(project)}
      onMouseLeave={() => onHover(null)}
      style={{ transformOrigin: 'left center', ...style }}
    >
      {children}
    </button>
  );
}

export function ProjectList(props: ProjectBrowserProps) {
  const { projects, selectedProject, hasSelection, onSelect, onHover } = props;

  return (
    <>
      {projects.map((project) => {
        const isSelected = selectedProject?.id === project.id;

        return (
          <ProjectButton
            key={project.id}
            project={project}
            dimmed={hasSelection && !isSelected}
            onSelect={() => onSelect(isSelected ? null : project)}
            onHover={(hovered) => {
              if (!selectedProject) onHover(hovered);
            }}
            className="group relative block w-full py-[var(--experience-row-padding)] text-left hover:scale-[var(--experience-scale)]"
          >
            <ProjectInlineAvatar project={project} visible={isSelected} />
            <span className="block min-w-0">
              <span className="mb-0.5 block text-sm font-normal text-[var(--experience-text)] transition-colors group-hover:text-[var(--experience-accent)]">
                {project.title}
              </span>
              <span className="block text-sm text-[var(--experience-muted)]">
                {project.year} <span className="mx-1">·</span> {project.description}
              </span>
            </span>
          </ProjectButton>
        );
      })}
    </>
  );
}

function ProjectInlineAvatar({ project, visible }: { project: Project; visible: boolean }) {
  const visibilityClass = visible
    ? 'opacity-100'
    : 'opacity-0 group-hover:opacity-100';

  return (
    <span
      className={`absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center transition-opacity duration-[var(--experience-motion)] ${visibilityClass}`}
      style={{ left: -PROJECT_AVATAR_OFFSET }}
      aria-hidden="true"
    >
      {project.avatar ? (
        <Image
          src={project.avatar}
          alt=""
          width={40}
          height={40}
          className="h-auto max-h-10 w-auto max-w-10 object-contain"
        />
      ) : (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-400">
          <span className="text-sm font-medium text-white">{project.title.charAt(0)}</span>
        </span>
      )}
    </span>
  );
}

export default function ProjectBrowser(props: ProjectBrowserProps) {
  return <ProjectList {...props} />;
}
