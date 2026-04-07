'use client';

import { ReactNode } from 'react';
import { TransitionProvider, TransitionOverlay } from './PageTransition';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <TransitionProvider>
      {children}
      <TransitionOverlay />
    </TransitionProvider>
  );
}
