/**
 * Finds the text this site sets in the *italic* display face.
 *
 * Instrument Serif ships roman and italic as separate files, and the italic is
 * preloaded on every page for three short strings — the two halves of the name
 * in the hero, and "hello." in the contact section. Subsetting it to exactly
 * those characters turns a 21 kB download into about 2 kB.
 *
 * The roman face is deliberately left alone: it sets publication titles and
 * section headings, which come from `src/data/profile.ts` and change with the
 * content. Its character set is not knowable from the markup, so subsetting it
 * would break the moment a paper with an unusual character was added.
 *
 * Shared by `scripts/fetch-italic-font.ts`, which builds the subset, and by
 * `tests/unit/italic-subset.test.ts`, which fails when the two drift apart.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

import { REPO_ROOT } from './cjk';

const SEARCH_DIRS = ['src/components', 'src/pages'];

/**
 * Elements that render in italic: anything carrying Tailwind's `italic` class,
 * and `<em>`, which `og.astro` styles as the italic half of the name.
 *
 * This is a list of *openings*; `readElement` below walks each one to its
 * matching close, because the interesting cases nest (`hello<span>.</span>`).
 */
const ITALIC_OPENING =
  /<(?<tag>[a-zA-Z][\w-]*)(?<attrs>[^>]*\bclass="[^"]*\bitalic\b[^"]*"[^>]*)>|<(?<em>em)\b(?<emAttrs>[^>]*)>/g;

/** `<SplitText text="Siqi" />` renders one `<span>` per character. */
const SPLIT_TEXT = /<SplitText[^>]*\btext="(?<text>[^"]*)"/g;

/** An Astro expression — `{profile.name}` — whose value is not in the markup. */
const EXPRESSION = /\{[^}]*\}/;

/**
 * Returns the inner markup of the element opening at `start`, by counting tags
 * of the same name until the depth returns to zero. Self-closing tags never
 * open a level.
 */
const readElement = (source: string, tag: string, openEnd: number): string => {
  const step = new RegExp(`<${tag}\\b[^>]*?(/?)>|</${tag}\\s*>`, 'g');
  step.lastIndex = openEnd;

  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = step.exec(source))) {
    if (match[0].startsWith('</')) depth -= 1;
    else if (match[1] !== '/') depth += 1;
    if (depth === 0) return source.slice(openEnd, match.index);
  }

  // Unbalanced markup would otherwise silently yield an empty character set.
  throw new Error(`unclosed <${tag}> while collecting italic text`);
};

/** Every `.astro` file under the searched directories. */
const astroFiles = (dir: string): string[] => {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...astroFiles(path));
    else if (entry.endsWith('.astro')) found.push(path);
  }
  return found;
};

export interface ItalicText {
  /** Each character rendered in italic → the files that render it. */
  readonly characters: Map<string, string[]>;
  /**
   * Italic elements whose content is an Astro expression rather than a literal.
   * These cannot be resolved without rendering, so the subset cannot be trusted
   * to cover them — callers are expected to treat a non-empty list as an error.
   */
  readonly unresolved: string[];
}

export const collectItalicText = (): ItalicText => {
  const characters = new Map<string, string[]>();
  const unresolved: string[] = [];

  const files = SEARCH_DIRS.flatMap((dir) => astroFiles(join(REPO_ROOT, dir)));

  for (const file of files) {
    const source = readFileSync(file, 'utf8');
    const label = relative(REPO_ROOT, file);

    for (const opening of source.matchAll(ITALIC_OPENING)) {
      const tag = opening.groups?.['tag'] ?? opening.groups?.['em'];
      if (!tag) continue;

      const inner = readElement(source, tag, opening.index + opening[0].length);

      // `<SplitText text="Siqi" />` contributes its attribute, not its markup.
      let literal = inner;
      for (const split of inner.matchAll(SPLIT_TEXT)) {
        literal += split.groups?.['text'] ?? '';
      }

      const text = literal.replace(/<[^>]*>/g, '');
      if (EXPRESSION.test(text)) unresolved.push(`${label}: ${text.trim().slice(0, 60)}`);

      for (const char of text.replace(EXPRESSION, '')) {
        if (/\s/.test(char)) continue;
        const sources = characters.get(char) ?? [];
        if (!sources.includes(label)) sources.push(label);
        characters.set(char, sources);
      }
    }
  }

  return { characters, unresolved };
};

/** `A` → `U+41`, matching the format `unicode-range` expects. */
export const toCodePoint = (char: string): string =>
  `U+${char.codePointAt(0)!.toString(16).toUpperCase()}`;
