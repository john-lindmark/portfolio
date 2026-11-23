'use client';

import { useEffect, useImperativeHandle, useRef, type Ref } from 'react';
import { FLOOD_MS } from './timing';

// The Winged Victory, turning under a fixed backlight. It lives in the root
// layout, so it stays loaded (and keeps turning) while pages change around it.
//
// "Flood" is a single 0..1 level that drives the page transition: as it rises
// the light's exposure climbs until the marble blows out to white, and the
// statue fades into the (by then white) background. Settling runs it back down.

export type StatueHandle = {
  /** Over-expose the statue until it dissolves into white. */
  flood(): Promise<boolean>;
  /** Bring the statue back from white to its normal light. */
  settle(): Promise<boolean>;
  /** Stop rendering (display: none) once it's fully flooded out. */
  hide(): void;
};

type ModelViewerElement = HTMLElement & {
  exposure: number;
  cameraOrbit: string;
  resetTurntableRotation(theta?: number): void;
};

const MAX_EXPOSURE = 9;

// Angles below are where the camera sits relative to the statue, as if the
// camera orbited; the statue turns on its own pivot to produce the same views.
const DEGREES_PER_SECOND = 5;
const FRONT = -30;     // view angle that faces the statue head-on
const START = -100;    // open on the statue's right wing, then turn to the front
const BASE_PITCH = 85; // camera angle down from straight overhead
const TILT = 8;        // +/- swing of that angle as the statue turns
const RADIUS = '330m'; // far back on a long (1.74deg) lens for a tight crop
const CAMERA = 0;      // fixed camera angle; the key light sits 110deg clockwise of it
// Updates are capped at ~30 a second: at this speed 30fps looks the same as
// 60 (or 120), and every update makes the GPU redraw 2M triangles.
const FRAME_MS = 1000 / 30;

const exposureAt = (level: number) => 1 + (MAX_EXPOSURE - 1) * level * level;
// The statue only starts to fade once it's well overexposed, and on the way
// back it's fully there before the light comes down.
const opacityAt = (level: number) => {
  const t = Math.min(Math.max((level - 0.45) / 0.55, 0), 1);
  return 1 - t * t * (3 - 2 * t);
};
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

// The opening: the light starts at nothing and comes up slowly, so the statue
// emerges from the dark by its light alone. The curve is squared because the
// eye picks up the first glimmers of light far more than the last steps to
// full, so the start has to be very gentle.
const REVEAL_DELAY_MS = 600;
const REVEAL_MS = 7000;
const lightAt = (t: number) => {
  const s = t * t * (3 - 2 * t);
  return s * s;
};

export function Statue({
  ref,
  flooded,
  onLoad,
  onHalfway,
}: {
  ref: Ref<StatueHandle>;
  /** Start fully flooded out (a page other than home was opened directly). */
  flooded: boolean;
  onLoad: () => void;
  /** The opening light-up, or a settle back from white, is half done. */
  onHalfway: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const viewer = useRef<ModelViewerElement>(null);
  const level = useRef(flooded ? 1 : 0);
  // Light for the opening reveal, 0..1, times the exposure. Opening on another
  // page there's no reveal from the dark, so it starts full.
  const light = useRef(flooded ? 1 : 0);
  const defined = useRef(false);
  const tween = useRef(0); // id of the running tween; a new one cancels the old
  const turning = useRef(false);
  const loaded = useRef<{ promise: Promise<void>; resolve: () => void } | null>(null);
  loaded.current ??= (() => {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => (resolve = r));
    return { promise, resolve };
  })();

  const apply = () => {
    const el = viewer.current;
    if (wrap.current) wrap.current.style.opacity = String(opacityAt(level.current));
    if (el && defined.current) el.exposure = exposureAt(level.current) * light.current;
  };

  const animateTo = (target: number) => {
    const id = ++tween.current;
    const from = level.current;
    const ms = FLOOD_MS * Math.abs(target - from);
    if (ms < 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      level.current = target;
      apply();
      return Promise.resolve(true);
    }
    return new Promise<boolean>((resolve) => {
      let t0: number | undefined;
      const step = (now: number) => {
        if (id !== tween.current) return resolve(false);
        t0 ??= now;
        const p = Math.min((now - t0) / ms, 1);
        level.current = from + (target - from) * easeInOut(p);
        apply();
        if (p < 1) requestAnimationFrame(step);
        else resolve(true);
      };
      requestAnimationFrame(step);
    });
  };

  const show = () => {
    if (wrap.current) wrap.current.hidden = false;
    turning.current = true;
  };

  useImperativeHandle(ref, () => ({
    flood: () => animateTo(1),
    async settle() {
      const id = ++tween.current; // cancel any flood in progress
      show();
      await loaded.current!.promise;
      if (id !== tween.current) return false;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const half = reduce ? 0 : (FLOOD_MS * level.current) / 2;
      setTimeout(() => id + 1 === tween.current && onHalfway(), half);
      return animateTo(0);
    },
    hide() {
      if (level.current < 1 || !wrap.current) return;
      wrap.current.hidden = true;
      turning.current = false;
    },
  }));

  useEffect(() => {
    const el = viewer.current!;
    let cancelled = false;
    let frame = 0;

    const viewAt = (theta: number) => {
      const pitch = BASE_PITCH + TILT * Math.cos(((theta - FRONT) * Math.PI) / 180);
      el.cameraOrbit = `${CAMERA}deg ${pitch}deg ${RADIUS}`;
      el.resetTurntableRotation(((CAMERA - theta) * Math.PI) / 180);
    };

    // The turn only advances while the statue is on screen, so it picks up
    // where it left off after a visit to another page.
    let angle = START;
    let last = -Infinity;
    const step = (now: number) => {
      if (cancelled) return;
      if (turning.current && now - last >= FRAME_MS - 2) {
        if (last > -Infinity) angle += (Math.min(now - last, 100) / 1000) * DEGREES_PER_SECOND;
        last = now;
        viewAt(angle % 360);
      } else if (!turning.current) {
        last = -Infinity;
      }
      frame = requestAnimationFrame(step);
    };

    // Bring the light up from nothing. If the page has already moved on (the
    // statue is flooding out), skip straight to full.
    const reveal = () => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || level.current > 0) {
        light.current = 1;
        apply();
        // Flooded (not on home): settle() says when it's halfway back instead.
        if (level.current === 0) onHalfway();
        return;
      }
      let halfway = false;
      let t0: number | undefined;
      const rise = (now: number) => {
        if (cancelled) return;
        t0 ??= now + REVEAL_DELAY_MS;
        const t = Math.min(Math.max((now - t0) / REVEAL_MS, 0), 1);
        light.current = level.current > 0 ? 1 : lightAt(t);
        apply();
        if (!halfway && t >= 0.5) {
          halfway = true;
          onHalfway();
        }
        if (light.current < 1) requestAnimationFrame(rise);
      };
      requestAnimationFrame(rise);
    };

    const onLoaded = () => {
      viewAt(START); // the opening view, set while it's still dark
      loaded.current!.resolve();
      onLoad();
      reveal();
      // Reduced motion: hold the statue still.
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) frame = requestAnimationFrame(step);
    };
    // Reveal even if the model fails, so the logo still shows.
    const onError = () => {
      loaded.current!.resolve();
      onLoad();
      onHalfway();
    };

    import('@google/model-viewer').then(async () => {
      await customElements.whenDefined('model-viewer');
      if (cancelled) return;
      // Keep full resolution: by default model-viewer drops to as little as a
      // quarter-res render when frames slow down, softening the scan detail.
      (customElements.get('model-viewer') as unknown as { minimumRenderScale: number }).minimumRenderScale = 1;
      defined.current = true;
      apply();
    });

    turning.current = !wrap.current!.hidden;
    el.addEventListener('load', onLoaded, { once: true });
    el.addEventListener('error', onError, { once: true });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      el.removeEventListener('load', onLoaded);
      el.removeEventListener('error', onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="statue" ref={wrap} hidden={flooded} style={{ opacity: opacityAt(level.current) }}>
      <model-viewer
        ref={viewer}
        src="/models/winged-victory.glb"
        alt="A 3D model of the Winged Victory of Samothrace, slowly turning"
        camera-orbit="0deg 87.7deg 330m"
        min-camera-orbit="auto auto 0m"
        max-camera-orbit="auto auto 500m"
        field-of-view="1.74deg"
        min-field-of-view="1deg"
        max-field-of-view="auto"
        camera-target="-4.3m 35m 4.31m"
        interpolation-decay="0"
        exposure={String(exposureAt(level.current) * light.current)}
        tone-mapping="aces"
        environment-image="/models/key-light.hdr"
      />
    </div>
  );
}
