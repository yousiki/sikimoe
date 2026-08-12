import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { REPO_ROOT } from '../../scripts/lib/cjk';
import { collectItalicText, toCodePoint } from '../../scripts/lib/italic';

/**
 * The italic display face is trimmed to the twelve characters the site sets in
 * it (see scripts/fetch-italic-font.ts). That saves 19 kB on a preloaded font,
 * and it means new italic text does not fail loudly — it just falls back to
 * whatever serif the OS has, in the largest words on the page. These tests are
 * the loud failure.
 */

const FONT_DIR = join(REPO_ROOT, 'src/styles/fonts');
const CSS_NAME = 'instrument-serif-italic-subset.css';
const WOFF2_NAME = 'instrument-serif-italic-subset.woff2';

const css = readFileSync(join(FONT_DIR, CSS_NAME), 'utf8');

const declaredRange = new Set(
  (/unicode-range:\s*([^;]+)/.exec(css)?.[1] ?? '')
    .split(',')
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean),
);

describe('the italic subset covers what the site renders', () => {
  const { characters, unresolved } = collectItalicText();

  it('finds the italic text at all', () => {
    // A collector that silently stopped matching would make every other
    // assertion here pass against an empty set.
    expect(characters.size, 'expected to find italic text under src/').toBeGreaterThan(0);
  });

  it('reads every italic element without hitting an expression', () => {
    /*
     * An italic element whose content is `{something}` cannot be resolved from
     * the markup, so the generated subset would not know to include it. The
     * generator refuses to run in that state; this says so at test time too.
     */
    expect(unresolved, 'italic text that cannot be read statically').toEqual([]);
  });

  it('declares a unicode-range for every italic character', () => {
    const missing = [...characters.entries()]
      .filter(([char]) => !declaredRange.has(toCodePoint(char)))
      .map(([char, sources]) => `${char} (${toCodePoint(char)}) in ${sources.join(', ')}`);

    expect(missing, 'these would fall back to a system serif — run `bun run fonts:italic`').toEqual(
      [],
    );
  });

  it('carries no glyphs the site stopped using', () => {
    const rendered = new Set([...characters.keys()].map(toCodePoint));
    const stale = [...declaredRange].filter((entry) => !rendered.has(entry));

    expect(stale, 'dead weight in the subset — run `bun run fonts:italic`').toEqual([]);
  });

  it('is declared italic, not roman', () => {
    // The whole point is a second file for `font-style: italic`. If the
    // generator ever wrote a roman face under this @font-face, the name would
    // render upright and nothing else would notice.
    expect(css).toMatch(/font-style:\s*italic/);
  });

  it('stays far smaller than the file it replaced', () => {
    // Fontsource's latin italic is ~21 kB. A regenerated subset that came back
    // anywhere near that means the `text=` parameter stopped being honoured and
    // the full face was written instead.
    const bytes = statSync(join(FONT_DIR, WOFF2_NAME)).size;
    expect(bytes).toBeLessThan(8 * 1024);
  });
});
