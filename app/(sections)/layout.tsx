import type { ReactNode } from 'react';
import { SiteNav } from '@/components/SiteNav';
import { TransitionLink } from '@/components/TransitionLink';

// Every page other than home: black on white, with the mark leading home.
export default function SectionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="section">
      <header className="site-header">
        <TransitionLink href="/" className="site-logo">
          <img src="/images/svg/lindmark-design-logo.svg" alt="Lindmark Design, home" />
        </TransitionLink>
        <SiteNav />
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
