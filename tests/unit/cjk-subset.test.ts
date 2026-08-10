import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { collectCjkCharacters, REPO_ROOT, toCodePointLabel } from '../../scripts/lib/cjk';

/**
 * The Chinese name is set in an LXGW WenKai TC subset trimmed to the exact
 * characters the site renders (see `scripts/fetch-cjk-font.ts`). That keeps the
 * font at ~2 kB, but it means new Chinese text does not fail loudly — it just
 * falls back to whatever CJK font the OS happens to have, which is the
 * inconsistency the subset exists to remove. These tests are the loud failure.
 */

const FONT_DIR = join(REPO_ROOT, 'src/styles/fonts');
const css = readFileSync(join(FONT_DIR, 'lxgw-wenkai-tc-subset.css'), 'utf8');

const declaredRange = new Set(
  (css.match(/unicode-range:\s*([^;]+)/)?.[1] ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean),
);

describe('the CJK subset covers what the site renders', () => {
  it('declares a unicode-range for every Chinese character under src/', () => {
    const rendered = collectCjkCharacters();
    expect(rendered.size, 'expected to find the Chinese name in src/').toBeGreaterThan(0);

    const missing = [...rendered.entries()]
      .filter(([char]) => !declaredRange.has(toCodePointLabel(char).toLowerCase()))
      .map(([char, sources]) => `${char} (${toCodePointLabel(char)}) in ${sources.join(', ')}`);

    expect(
      missing,
      'these characters would fall back to a system font — run `bun run fonts:cjk`',
    ).toEqual([]);
  });

  it('carries no glyphs the site stopped using', () => {
    const rendered = new Set(
      [...collectCjkCharacters().keys()].map((char) => toCodePointLabel(char).toLowerCase()),
    );
    const stale = [...declaredRange].filter((entry) => !rendered.has(entry));

    expect(stale, 'dead weight in the font — run `bun run fonts:cjk`').toEqual([]);
  });
});

describe('the generated font-face', () => {
  it('points at a woff2 that exists', () => {
    const src = css.match(/url\('\.\/([^']+)'\)/)?.[1];
    expect(src, 'the @font-face should reference a local file').toBeTruthy();
    expect(existsSync(join(FONT_DIR, src!))).toBe(true);
  });

  it('stays under the 4 kB limit Vite inlines assets below', () => {
    // Past this the font becomes a separate request, and the name would swap in
    // after first paint instead of with it.
    const bytes = statSync(join(FONT_DIR, 'lxgw-wenkai-tc-subset.woff2')).size;
    expect(bytes).toBeLessThan(4096);
  });

  it('declares the single weight the face actually ships', () => {
    // WenKai is not variable: Google Fonts serves 300/400/700 as separate files
    // and rejects a range outright. A range here would claim the one downloaded
    // file covers weights it does not, so every request in that range would
    // silently resolve to 400 — the drift this asserts against is someone
    // widening AXIS in the fetch script without shipping the extra files.
    expect(css).toMatch(/font-weight:\s*400\s*;/);
  });
});
