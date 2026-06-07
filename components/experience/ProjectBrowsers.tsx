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

export function ProjectGrid(props: ProjectBrowserProps) {
  const { projects, selectedProject, hasSelection, onSelect, onHover } = props;

  return (
    <div className="grid grid-cols-1 gap-[var(--experience-gap)] sm:grid-cols-2 md:grid-cols-1">
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
            className="group rounded-2xl bg-[var(--experience-card)] p-[var(--experience-card-padding)] text-left hover:scale-[var(--experience-scale)]"
            style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
          >
            <h2 className="mb-1 text-sm font-medium text-[var(--experience-text)] group-hover:text-[var(--experience-accent)]">
              {project.title}
            </h2>
            <p className="text-sm text-[var(--experience-muted)]">{project.year}</p>
            <p className="mt-2 text-sm text-[var(--experience-muted)]">{project.description}</p>
          </ProjectButton>
        );
      })}
    </div>
  );
}

export function ProjectTimeline(props: ProjectBrowserProps) {
  const { projects, selectedProject, hasSelection, onSelect, onHover } = props;

  return (
    <div className="relative space-y-1 before:absolute before:left-2 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-[var(--experience-border)]">
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
            className="group relative block w-full py-[var(--experience-row-padding)] pl-7 text-left hover:scale-[var(--experience-scale)]"
          >
            <span className="absolute left-[0.3125rem] top-5 h-3 w-3 rounded-full bg-[var(--experience-card)]" style={{ boxShadow: '0 0 0 0.5px var(--experience-accent)' }} />
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-[var(--experience-muted)]">{project.year}</span>
              <h2 className="text-sm font-normal text-[var(--experience-text)] group-hover:text-[var(--experience-accent)]">{project.title}</h2>
            </div>
            <p className="text-sm text-[var(--experience-muted)]">{project.description}</p>
          </ProjectButton>
        );
      })}
    </div>
  );
}

export function ProjectCaseStudyCards(props: ProjectBrowserProps) {
  const { projects, selectedProject, hasSelection, onSelect, onHover } = props;

  return (
    <div className="space-y-[var(--experience-gap)]">
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
            className="group block w-full rounded-[1.35rem] bg-[var(--experience-card)] p-[var(--experience-card-padding)] text-left hover:scale-[var(--experience-scale)]"
            style={{ boxShadow: '0 0 0 0.5px var(--experience-border)' }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-[var(--experience-text)] group-hover:text-[var(--experience-accent)]">{project.title}</h2>
              <span className="rounded-full bg-[var(--experience-accent-soft)] px-2 py-0.5 text-xs text-[var(--experience-accent)]">{project.year}</span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--experience-muted)]">{project.description}</p>
            {project.role && <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[var(--experience-muted)]">{project.role}</p>}
          </ProjectButton>
        );
      })}
    </div>
  );
}

export default function ProjectBrowser(props: ProjectBrowserProps) {
  return <ProjectList {...props} />;
}
