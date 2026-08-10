/**
 * Finds the CJK characters the site actually renders.
 *
 * Shared by `scripts/fetch-cjk-font.ts`, which subsets the font down to exactly
 * this set, and by `tests/unit/cjk-subset.test.ts`, which fails if the committed
 * subset has fallen behind it. Both need the same answer, so neither owns it.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export const REPO_ROOT = new URL('../..', import.meta.url).pathname.replace(/\/$/, '');

const SCANNED_EXTENSIONS = /\.(astro|ts|tsx|js|mjs|json|md|css|svg|html)$/;

/**
 * `styles/fonts` holds the generated subset, whose header comment lists the very
 * characters being searched for. Scanning it would make the set self-sustaining:
 * a name deleted from the site would still be found in the font that exists to
 * render it, so the subset could never shrink.
 */
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.astro', '.git', 'fonts']);

/**
 * Ranges a Han glyph can land in: CJK Unified Ideographs plus its extension A,
 * compatibility forms, CJK punctuation, and the fullwidth block. Kana is left
 * out because the site sets no Japanese, not because the face lacks it — LXGW
 * WenKai TC descends from Klee One and covers kana fine. If Japanese ever gets
 * added, widen this list and re-run `bun run fonts:cjk`; until then a stray kana
 * would only pad the subset with a glyph nothing renders.
 */
const CJK_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x3000, 0x303f], // CJK symbols and punctuation
  [0x3400, 0x4dbf], // Unified Ideographs Extension A
  [0x4e00, 0x9fff], // Unified Ideographs
  [0xf900, 0xfaff], // Compatibility Ideographs
  [0xff00, 0xffef], // Halfwidth and fullwidth forms
];

export const isCjk = (codePoint: number): boolean =>
  CJK_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end);

/** `U+4e2d`, matching the casing `unicode-range` is authored in. */
export const toCodePointLabel = (char: string): string =>
  `U+${(char.codePointAt(0) ?? 0).toString(16).padStart(4, '0')}`;

/**
 * Every CJK character under `dir`, mapped to the files it appears in, sorted by
 * code point so an unchanged character set always produces an identical request
 * — and therefore a byte-identical font file — on a re-run.
 */
export function collectCjkCharacters(dir = join(REPO_ROOT, 'src')): Map<string, string[]> {
  const found = new Map<string, Set<string>>();

  const walk = (current: string): void => {
    for (const entry of readdirSync(current)) {
      if (IGNORED_DIRS.has(entry)) continue;

      const path = join(current, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      if (!SCANNED_EXTENSIONS.test(entry)) continue;

      for (const char of readFileSync(path, 'utf8')) {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined || !isCjk(codePoint)) continue;

        const sources = found.get(char) ?? new Set<string>();
        sources.add(relative(REPO_ROOT, path));
        found.set(char, sources);
      }
    }
  };

  walk(dir);

  return new Map(
    [...found.entries()]
      .sort(([a], [b]) => (a.codePointAt(0) ?? 0) - (b.codePointAt(0) ?? 0))
      .map(([char, sources]) => [char, [...sources].sort()]),
  );
}
