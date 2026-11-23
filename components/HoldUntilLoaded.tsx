'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

// Holds its content on white until the first image inside has loaded (or
// failed), then marks itself ready so the CSS can fade it all in together.
export function HoldUntilLoaded({ className, children }: { className?: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = root.current?.querySelector('img');
    if (!img || img.complete) {
      setReady(true);
      return;
    }
    const done = () => setReady(true);
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
    return () => {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
    };
  }, []);

  return (
    <div ref={root} className={className} data-ready={ready || undefined}>
      {children}
    </div>
  );
}
