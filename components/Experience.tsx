'use client';

import { createContext, memo, useCallback, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Statue, type StatueHandle } from './Statue';
import { CENTER_MS, FLOOD_MS, LEAVE_MS, normalizePath } from './timing';

// Orchestrates moves between pages. Home is the dark stage with the statue;
// every other page sits on white. Leaving home floods the statue with light
// while the background turns white, and only then does the next page load.
// Coming back runs it in reverse. The statue lives here, in the root layout,
// so it stays loaded the whole time.

type Leaving = 'home' | 'section' | 'page' | null;

const Navigate = createContext<(href: string) => void>(() => {});
export const useNavigate = () => useContext(Navigate);

const StaticStatue = memo(Statue);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Experience({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = normalizePath(usePathname());
  const isHome = pathname === '/';
  const statue = useRef<StatueHandle>(null);
  const busy = useRef(false);
  const [openedOnHome] = useState(isHome);
  const [tone, setTone] = useState<'dark' | 'light'>(isHome ? 'dark' : 'light');
  const [leaving, setLeaving] = useState<Leaving>(null);
  // "first" plays the slow opening reveal; after any move it's quicker.
  const [entry, setEntry] = useState<'first' | 'return'>('first');
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);

  // Settle into whatever page we've landed on. This also covers the browser's
  // back and forward buttons, which skip navigate() below.
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    busy.current = false;
    setLeaving(null);
    setEntry('return');
    if (isHome) {
      setTone('dark');
      statue.current?.settle();
    } else {
      setTone('light');
      statue.current?.flood().then((done) => done && statue.current?.hide());
    }
  }, [pathname, isHome]);

  const navigate = useCallback(
    async (href: string) => {
      const target = normalizePath(href);
      if (busy.current || target === pathname) return;
      busy.current = true;
      router.prefetch(href);
      if (isHome) {
        // Dark to light: the light swells and the room goes white first.
        setLeaving('home');
        setTone('light');
        await statue.current?.flood();
      } else {
        setLeaving(target === '/' ? 'section' : 'page');
        await wait(LEAVE_MS);
      }
      router.push(href);
    },
    [pathname, isHome, router],
  );

  return (
    <Navigate.Provider value={navigate}>
      <div
        className="stage"
        data-tone={tone}
        data-route={isHome ? 'home' : 'section'}
        data-leaving={leaving ?? undefined}
        data-entry={entry}
        data-loaded={loaded || undefined}
        style={{ '--center': `${CENTER_MS}ms`, '--flood': `${FLOOD_MS}ms`, '--leave': `${LEAVE_MS}ms` } as CSSProperties}
      >
        <StaticStatue ref={statue} flooded={!openedOnHome} onLoad={onLoad} />
        {children}
      </div>
    </Navigate.Provider>
  );
}
