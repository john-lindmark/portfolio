'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useNavigate } from './Experience';
import { SECTIONS } from './sections';
import { CENTER_MS, TAP_HOLD_MS } from './timing';
import { TransitionLink } from './TransitionLink';

// The links under the logo stay out of sight until they're wanted: with a
// mouse, while the pointer is over the centre of the screen; on a touch
// screen, for a few seconds after a tap anywhere. Keyboard focus shows
// them too (see .home-nav:focus-within in the CSS).
//
// Choosing one glides it to the centre, under the logo, as the others fade;
// only then does the light flood the statue and the page change.

/** Share of the screen's width and height, centred, that reveals the links
 *  to a mouse. (On a touch screen a tap anywhere does.) */
const ZONE = 0.3;
/** Slack around the links themselves, so reaching for one never hides them. */
const SLACK = 24;

export function HomeNav() {
  const navigate = useNavigate();
  const nav = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const isOpen = useRef(false);
  const isChosen = useRef(false);
  const timer = useRef(0);

  const show = (next: boolean) => {
    if (isChosen.current) return; // stay up through the transition
    isOpen.current = next;
    setOpen(next);
  };

  useEffect(() => {
    const inZone = (x: number, y: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (Math.abs(x - w / 2) <= (w * ZONE) / 2 && Math.abs(y - h / 2) <= (h * ZONE) / 2) return true;
      // On narrow screens the row of links can reach past the zone; once
      // they're showing, the pointer can travel along them.
      const links = isOpen.current && nav.current?.querySelectorAll('a');
      if (!links || !links.length) return false;
      const first = links[0].getBoundingClientRect();
      const last = links[links.length - 1].getBoundingClientRect();
      return x >= first.left - SLACK && x <= last.right + SLACK && y >= first.top - SLACK && y <= first.bottom + SLACK;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') show(inZone(e.clientX, e.clientY));
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return; // a tap anywhere on the page
      show(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => show(false), TAP_HOLD_MS);
    };
    const onLeave = () => show(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab etc.
    e.preventDefault();
    if (isChosen.current) return;
    // How far this link sits from the centre line under the logo, so it can
    // glide there.
    const row = nav.current!.getBoundingClientRect();
    const link = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--shift', `${row.left + row.width / 2 - (link.left + link.width / 2)}px`);
    show(true);
    isChosen.current = true;
    clearTimeout(timer.current);
    setChosen(href);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => navigate(href), reduce ? 0 : CENTER_MS);
  };

  return (
    <nav
      ref={nav}
      className="home-nav"
      data-open={open || undefined}
      data-chosen={chosen ? true : undefined}
      aria-label="Sections"
    >
      {SECTIONS.map(({ href, label }) => (
        <TransitionLink
          key={href}
          href={href}
          onClick={(e) => choose(e, href)}
          data-chosen={chosen === href || undefined}
          aria-current={chosen === href ? 'page' : undefined}
        >
          {label}
        </TransitionLink>
      ))}
    </nav>
  );
}
