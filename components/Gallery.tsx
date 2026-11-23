'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Gallery as GallerySet, Photo } from './galleries';

// One photo at a time, fitted inside the screen with a 32px margin. Move
// through them with the arrow keys, a swipe, or the arrows that sit in the
// margins either side of the photo, vertically centred.
//
// Nothing shows until the first photo has loaded: the page holds on white,
// then everything fades in together (see .gallery[data-ready] in the CSS).
// Each later photo also fades in only once it has loaded.
//
// The button in the top-right corner swaps, slowly, to a grid of every photo
// (2 columns on phones, 3 wider up) that scrolls vertically. Choosing one
// opens it; Escape or the button again goes back.

/** Horizontal travel (px) that counts as a swipe. */
const SWIPE = 40;

const SIZES = [1280, 2560];

/** "View all" grid icon. */
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5,11V3.5H11V11H3.5Zm0,9.5V13H11v7.5H3.5ZM13,11V3.5h7.5V11H13Zm0,9.5V13h7.5v7.5H13ZM5,9.5H9.5V5H5V9.5Zm9.5,0H19V5H14.5V9.5Zm0,9.5H19V14.5H14.5V19ZM5,19H9.5V14.5H5V19Zm9.5-9.5Zm0,5Zm-5,0Zm0-5Z" />
    </svg>
  );
}

/** "One photo" icon, shown on the toggle while the grid is open. */
function SingleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.5,20.5V3.5h17v17H3.5ZM5,19H19V5H5V19Zm0,0V5V19Z" />
    </svg>
  );
}

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
  const { folder, title, caption, photos } = set;
  const count = photos.length;
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const markLoaded = useCallback(
    (name: string) => setLoaded((done) => (done.has(name) ? done : new Set(done).add(name))),
    [],
  );
  const ready = loaded.has(photos[0].name);
  const go = useCallback((step: number) => setIndex((i) => (i + step + count) % count), [count]);

  // The grid is only built the first time it's asked for, then kept, so it can
  // fade in and out rather than appear.
  const [grid, setGrid] = useState(false);
  const [gridBuilt, setGridBuilt] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState<ReadonlySet<string>>(() => new Set());
  const markTile = useCallback(
    (name: string) => setTilesLoaded((done) => (done.has(name) ? done : new Set(done).add(name))),
    [],
  );
  const gridEl = useRef<HTMLDivElement>(null);
  const openGrid = () => {
    setGridBuilt(true);
    // Let the grid land in the page, hidden, before showing it, so it fades.
    requestAnimationFrame(() => requestAnimationFrame(() => setGrid(true)));
  };
  const openPhoto = (i: number) => {
    setIndex(i);
    setGrid(false);
  };

  // Opening the grid, bring the photo you were on into view.
  useEffect(() => {
    if (!grid) return;
    const tile = gridEl.current?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    tile?.scrollIntoView({ block: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (grid) {
        if (e.key !== 'Escape') return;
        setGrid(false);
      } else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, grid]);

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

  // A photo that finished loading before React took over the page never fires
  // onLoad, so check the ones already in the page once on arrival.
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    frame.current?.querySelectorAll<HTMLImageElement>('img[data-name]').forEach((img) => {
      if (img.complete) markLoaded(img.dataset.name!);
    });
  }, [markLoaded]);

  // Only the current photo and its neighbours are in the page, so the next
  // one is usually loaded before it's asked for.
  const near = (i: number) => {
    const d = Math.abs(i - index);
    return d <= 1 || d === count - 1;
  };

  return (
    <div
      className="gallery"
      data-ready={ready || undefined}
      data-view={grid ? 'grid' : 'single'}
      aria-roledescription="carousel"
      aria-label={title}
    >
      <div className="gallery-single" inert={grid}>
        <div
          ref={frame}
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
                data-name={photo.name}
                data-current={i === index || undefined}
                data-loaded={loaded.has(photo.name) || undefined}
                onLoad={() => markLoaded(photo.name)}
                onError={() => markLoaded(photo.name)}
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
        {caption && (
          <p className="gallery-caption">
            {/* Each part stays whole; on a narrow screen it only breaks at a bullet. */}
            <span>
              {caption.split(' • ').map((part, i) => (
                <span key={i}>
                  {i > 0 && ' • '}
                  <span className="nowrap">{part}</span>
                </span>
              ))}
            </span>
          </p>
        )}
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
      </div>

      {gridBuilt && (
        <div ref={gridEl} className="gallery-grid" inert={!grid}>
          <ul>
            {photos.map((photo, i) => (
              <li key={photo.name}>
                <button type="button" data-index={i} aria-label={`Open ${title}, ${i + 1} of ${count}`} onClick={() => openPhoto(i)}>
                  <img
                    src={`/images/${folder}/${photo.name}-1280.jpg`}
                    srcSet={sources(folder, photo)}
                    sizes="(min-width: 768px) calc((100vw - 128px) / 3), calc((100vw - 96px) / 2)"
                    width={photo.width}
                    height={photo.height}
                    alt=""
                    data-loaded={tilesLoaded.has(photo.name) || undefined}
                    onLoad={() => markTile(photo.name)}
                    onError={() => markTile(photo.name)}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        className="gallery-toggle"
        aria-label={grid ? 'Back to one photo' : 'Show all photos'}
        aria-pressed={grid}
        onClick={() => (grid ? setGrid(false) : openGrid())}
      >
        <span data-icon="grid">
          <GridIcon />
        </span>
        <span data-icon="single">
          <SingleIcon />
        </span>
      </button>

      <p className="visually-hidden" aria-live="polite">
        {grid ? `${title}, all ${count} photos` : `${title}, photo ${index + 1} of ${count}`}
      </p>
    </div>
  );
}
