'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';
import { useNavigate } from './Experience';

// A link that plays the page transition before navigating. Modified clicks
// (new tab, new window) behave like any other link.
export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const navigate = useNavigate();
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };
  return <Link href={href} onClick={handleClick} {...props} />;
}
