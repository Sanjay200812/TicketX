import React, { ViewTransition } from 'react';

/** Wraps each page so route changes slide (forward/back) or fade, using React view transitions. */
export function Page({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'page-fade' }}
      exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'page-fade' }}
      default="none"
    >
      <div>{children}</div>
    </ViewTransition>
  );
}
