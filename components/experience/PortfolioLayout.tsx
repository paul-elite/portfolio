'use client';

import type { ReactNode, Ref } from 'react';

export const PROJECT_LIST_CONTENT_CLASS = 'pl-[52px] md:-ml-[72px] md:w-[calc(100%+72px)] md:pl-[72px]';

export function PortfolioHomeFrame({ children }: { children: ReactNode }) {
  return (
    <div className="portfolio-home relative h-full max-h-dvh flex flex-col overflow-hidden pt-12 pb-5 pl-2 pr-3 md:pt-[100px] md:pb-6 md:px-6">
      {children}
    </div>
  );
}

export function PortfolioDesktopGrid({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex md:grid md:grid-cols-[56px_minmax(260px,340px)_minmax(0,572px)_minmax(96px,1fr)] gap-4 md:gap-6 min-h-0 overflow-visible">
      {children}
    </div>
  );
}

export function DesktopAvatarRail({
  profile,
  section,
  content,
  utility,
  contentRef,
}: {
  profile: ReactNode;
  section: ReactNode;
  content: ReactNode;
  utility: ReactNode;
  contentRef: Ref<HTMLDivElement>;
}) {
  return (
    <div className="hidden md:flex md:col-[1] flex-col items-center h-full overflow-visible">
      <div className="h-14 mb-4 flex items-start justify-center">
        {profile}
      </div>

      {section}

      <div className="flex-1 min-h-0 relative">
        <div ref={contentRef} className="absolute inset-0 overflow-y-auto hide-scrollbar">
          {content}
        </div>
      </div>

      {utility}
    </div>
  );
}

export function PortfolioSidebar({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 md:col-[2] flex flex-col min-w-0 h-full overflow-visible">
      {children}
    </div>
  );
}

export function PortfolioDetailColumn({ children, showTopFade }: { children: ReactNode; showTopFade: boolean }) {
  return (
    <div className="hidden md:block md:col-[3] relative h-full min-w-0">
      {showTopFade && (
        <div className="absolute -top-8 left-0 right-0 h-12 bg-gradient-to-b from-background from-0% via-background/20 via-50% to-transparent to-100% z-10 pointer-events-none" />
      )}
      {children}
    </div>
  );
}
