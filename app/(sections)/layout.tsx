import type { ReactNode } from 'react';
import { HEADER_ACTION_ID } from '@/components/HeaderAction';
import { SectionLabel } from '@/components/SectionLabel';
import { TransitionLink } from '@/components/TransitionLink';

// Every page other than home: black on white, framed by a 32px margin. They
// all share one header, a solid strip in the top margin: close (back home)
// in the left square, the section's name centred, and the page's own action,
// if it has one, in the right square (see components/HeaderAction.tsx).
export default function SectionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="section">
      <header className="site-header">
        <TransitionLink href="/" className="site-icon site-close" aria-label="Close, back to home">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6.4,18.65L5.35,17.6l5.6-5.6L5.35,6.4L6.4,5.35l5.6,5.6l5.6-5.6L18.65,6.4L13.05,12l5.6,5.6L17.6,18.65L12,13.05l-5.6,5.6Z" />
          </svg>
        </TransitionLink>
        <SectionLabel />
        <div id={HEADER_ACTION_ID} className="site-action" />
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
