'use client';

import { usePathname } from 'next/navigation';
import { normalizePath } from './timing';

const EMAIL = 'lindmarkjohn@gmail.com';

/** Mail icon in the header's top-right square, on the About page only. */
export function HeaderEmail() {
  if (normalizePath(usePathname()) !== '/about') return null;
  return (
    <a className="site-email" href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2.5,19.5V4.5h19v15H2.5ZM12,12.56L4,7.44V18H20V7.44l-8,5.12ZM12,11l7.85-5H4.15L12,11ZM4,7.44V6V7.44V18V7.44Z" />
      </svg>
    </a>
  );
}
