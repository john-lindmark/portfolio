'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Every section page shares one header: close on the left, the section name
// in the middle, and a slot on the right for that page's own action (the
// grid toggle on the galleries, email on About). A page puts its action there
// by wrapping it in <HeaderAction>.

export const HEADER_ACTION_ID = 'site-action';

export function HeaderAction({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => setSlot(document.getElementById(HEADER_ACTION_ID)), []);
  return slot ? createPortal(children, slot) : null;
}
