// Shared timings for the page transitions (the CSS reads them as custom
// properties set on the stage, so JS and CSS stay in step).

/** A chosen home link gliding to centre while the others fade, before the flood. */
export const CENTER_MS = 900;
/** Black to white: the light floods the statue as the background turns white. */
export const FLOOD_MS = 1800;
/** Content fading out before the next page comes in. */
export const LEAVE_MS = 450;
/** How long the home links stay up after a tap on a touch screen. */
export const TAP_HOLD_MS = 5000;

export const normalizePath = (path: string | null) =>
  !path || path === '/' ? '/' : path.replace(/\/+$/, '');
