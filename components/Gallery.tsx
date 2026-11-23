'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Gallery as GallerySet, Photo } from './galleries';

// One photo at a time, fitted inside the screen with a 32px margin. Move
// through them with the arrow keys, a swipe, or the arrows that sit in the
// margins either side of the photo, vertically centred.

/** Horizontal travel (px) that counts as a swipe. */
const SWIPE = 40;

const SIZES = [1280, 2560];

/** Right-pointing arrow (Previous mirrors it in CSS). */
function Arrow() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true">
      <path d="M10.3847 13.2403L9.59419 12.427L12.4586 9.56252H3.375V8.43752H12.4586L9.59419 5.57308L10.3847 4.7597L14.625 9.00002L10.3847 13.2403Z" />
    </svg>
  );
}

function sources(folder: string, { name, width, height }: Photo) {
  const long = Math.max(width, height);
  return SIZES.map((size) => {
    const w = Math.round(width * Math.min(1, size / long));
    return `/images/${folder}/${name}-${size}.jpg ${w}w`;
  }).join(', ');
}

export function Gallery({ set }: { set: GallerySet }) {
  const { folder, title, photos } = set;
  const count = photos.length;
  const [index, setIndex] = useState(0);
  const go = useCallback((step: number) => setIndex((i) => (i + step + count) % count), [count]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  // Swipes: horizontal moves only, so a vertical drag never flips the photo.
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onPointerUp = (e: PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
  };

  // Only the current photo and its neighbours are in the page, so the next
  // one is usually loaded before it's asked for.
  const near = (i: number) => {
    const d = Math.abs(i - index);
    return d <= 1 || d === count - 1;
  };

  return (
    <div className="gallery" aria-roledescription="carousel" aria-label={title}>
      <div
        className="gallery-frame"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (start.current = null)}
      >
        {photos.map((photo, i) =>
          near(i) ? (
            <img
              key={photo.name}
              className="gallery-photo"
              data-current={i === index || undefined}
              src={`/images/${folder}/${photo.name}-1280.jpg`}
              srcSet={sources(folder, photo)}
              sizes="calc(100vw - 64px)"
              width={photo.width}
              height={photo.height}
              alt={`${title}, ${i + 1} of ${count}`}
              aria-hidden={i !== index || undefined}
              draggable={false}
              decoding="async"
            />
          ) : null,
        )}
      </div>
      {count > 1 && (
        <>
          <button type="button" className="gallery-arrow" data-dir="prev" aria-label="Previous photo" onClick={() => go(-1)}>
            <Arrow />
          </button>
          <button type="button" className="gallery-arrow" data-dir="next" aria-label="Next photo" onClick={() => go(1)}>
            <Arrow />
          </button>
        </>
      )}
      <p className="visually-hidden" aria-live="polite">
        {title}, photo {index + 1} of {count}
      </p>
    </div>
  );
}
