'use client';

import { usePathname } from 'next/navigation';
import { SECTIONS } from './sections';
import { normalizePath } from './timing';
import { TransitionLink } from './TransitionLink';

export function SiteNav() {
  const pathname = normalizePath(usePathname());
  return (
    <nav className="site-nav" aria-label="Sections">
      {SECTIONS.map(({ href, label }) => (
        <TransitionLink key={href} href={href} aria-current={normalizePath(href) === pathname ? 'page' : undefined}>
          {label}
        </TransitionLink>
      ))}
    </nav>
  );
}
