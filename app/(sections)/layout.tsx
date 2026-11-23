import type { ReactNode } from 'react';
import { SectionLabel } from '@/components/SectionLabel';
import { TransitionLink } from '@/components/TransitionLink';

// Every page other than home: black on white, framed by a 32px margin. The
// mark sits in the top-left corner square and leads home; the section's name
// sits centred in the top margin.
export default function SectionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="section">
      <header className="site-header">
        <TransitionLink href="/" className="site-logo">
          <img src="/images/svg/lindmark-design-logo.svg" alt="Lindmark Design, home" />
        </TransitionLink>
        <SectionLabel />
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
