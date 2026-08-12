import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/**
 * The hero paragraph is the page's LCP element. Its entrance animation is the
 * single largest lever on LCP that this site has, and getting it wrong is
 * invisible: the page looks right, every other test passes, and LCP quietly
 * moves from ~1.4 s to ~2.7 s under mobile throttling.
 *
 * Measured (1638 kbps, 150 ms RTT, CPU 4×, median of five loads):
 *
 *   data-reveal, 560 ms delay, 0.9 s fade   LCP 2664 ms   (shipped through v2.2.1)
 *   same but delay 0 ms                     LCP 2516 ms
 *   CSS animation, opacity 0 → 1            LCP 2504 ms
 *   CSS animation, opacity 0.35 → 1         LCP  = FCP     ← current
 *
 * The penalty is a flat ~1100 ms for starting at `opacity: 0`, independent of
 * duration and delay, because Chrome will not accept a fully transparent element
 * as an LCP candidate.
 */
const hero = readFileSync('src/components/sections/Hero.astro', 'utf8');

/** The wrapper around the hero paragraph — the LCP element. */
const introWrapper = /<div class="hero-intro[^"]*"([^>]*)>/.exec(hero);

describe('the LCP element', () => {
  it('is wrapped in .hero-intro', () => {
    // If this fails the class was renamed, and every assertion below is checking
    // markup that no longer exists — so fail here rather than pass vacuously.
    expect(introWrapper, 'no <div class="hero-intro"> in Hero.astro').not.toBeNull();
  });

  it('does not wait for JS to become visible', () => {
    /*
     * `data-reveal` is released by `initReveal` in src/scripts/reveal.ts, so an
     * element carrying it stays at `opacity: 0` until the module has downloaded,
     * parsed and run. That is the wrong side of the critical path for the largest
     * element on the page.
     */
    expect(introWrapper?.[1] ?? '').not.toContain('data-reveal');
  });

  it('never starts fully transparent', () => {
    /*
     * The load-bearing number. Chrome ignores an element with `opacity: 0` as an
     * LCP candidate, so a fade from zero defers LCP until the fade has run — a
     * flat ~1100 ms penalty regardless of how brief the fade is. Any value above
     * zero keeps the element eligible from its first paint.
     */
    const keyframes = /@keyframes hero-intro\s*\{([\s\S]*?)\n {2}\}/.exec(hero)?.[1] ?? '';
    expect(keyframes, 'no @keyframes hero-intro in Hero.astro').not.toBe('');

    const from = /from\s*\{([\s\S]*?)\}/.exec(keyframes)?.[1] ?? '';
    const opacity = Number(/opacity:\s*([\d.]+)/.exec(from)?.[1] ?? '1');

    expect(opacity, 'the hero paragraph must not fade in from zero').toBeGreaterThan(0);
  });

  it('still honours reduced motion', () => {
    // The animation is CSS rather than JS now, so the reduced-motion escape has
    // to be CSS too — `initReveal`'s check no longer covers this element.
    const reduced = /@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n {2}\}/.exec(
      hero,
    )?.[1];
    expect(reduced).toContain('.hero-intro');
  });
});
