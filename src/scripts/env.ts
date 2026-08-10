/** Small shared helpers for the client-side modules. */

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = (): boolean =>
  window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(hover: none)').matches;

export const clamp = (value: number, min: number, max: number): number =>
  value < min ? min : value > max ? max : value;

export const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

/** `document.querySelectorAll` with a concrete element type and a real array. */
export const queryAll = <T extends Element = HTMLElement>(
  selector: string,
  root: ParentNode = document,
): T[] => Array.from(root.querySelectorAll<T>(selector));

/**
 * Runs `fn` once the document is interactive. Astro injects module scripts with
 * `defer`, but view transitions can re-run them against a live document.
 */
export const onReady = (fn: () => void): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
};
