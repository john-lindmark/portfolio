'use client';

import { usePathname } from 'next/navigation';
import { SECTIONS } from './sections';
import { normalizePath } from './timing';

/** The current section's name, shown top centre. */
export function SectionLabel() {
  const pathname = normalizePath(usePathname());
  const section = SECTIONS.find(({ href }) => normalizePath(href) === pathname);
  return section ? <p className="site-label">{section.label}</p> : null;
}
