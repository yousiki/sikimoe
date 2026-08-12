import { describe, expect, it } from 'vitest';

import {
  collectScriptHashes,
  extractInlineScripts,
  hashInlineScript,
  SCRIPT_HASH_PLACEHOLDER,
} from '../../scripts/lib/csp';

/**
 * `scripts/build-headers.ts` uses these to name the site's inline scripts in the
 * Content-Security-Policy. A wrong hash is close to the worst outcome available:
 * the browser blocks the theme bootstrap in `BaseHead.astro`, the site paints the
 * wrong palette and then corrects itself, and nothing about the build failed.
 * Nothing local catches that except `bun run serve` plus a real browser, so what
 * can be pinned here is pinned here.
 */

describe('extractInlineScripts', () => {
  it('skips external scripts and keeps inline ones', () => {
    const html = `
      <script type="module" src="/_astro/entry.js"></script>
      <script>document.documentElement.dataset.theme = 'dark';</script>
    `;

    expect(extractInlineScripts(html)).toEqual([
      "document.documentElement.dataset.theme = 'dark';",
    ]);
  });

  it('keeps a JSON-LD block, which never executes but is still held to script-src', () => {
    const html = '<script type="application/ld+json">{"@type":"Person"}</script>';

    expect(extractInlineScripts(html)).toEqual(['{"@type":"Person"}']);
  });

  it('reproduces the body byte for byte', () => {
    // A hash is taken over exactly what sits between the tags, so trimming the
    // whitespace or collapsing the newlines here would produce a hash that no
    // browser ever computes.
    const body = '\n  const a = 1;\n\n  const b = 2;\n';

    expect(extractInlineScripts(`<script>${body}</script>`)).toEqual([body]);
  });

  it('ignores an empty inline script, which needs no hash', () => {
    expect(extractInlineScripts('<script></script>')).toEqual([]);
  });

  it('does not let one script swallow the next', () => {
    const html = '<script>one</script><p>between</p><script>two</script>';

    expect(extractInlineScripts(html)).toEqual(['one', 'two']);
  });
});

describe('hashInlineScript', () => {
  it('matches sha256 computed elsewhere', () => {
    // `printf 'hello' | openssl dgst -sha256 -binary | openssl base64`
    expect(hashInlineScript('hello')).toBe("'sha256-LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ='");
  });

  it('quotes the expression', () => {
    /*
     * This is not cosmetic, and it is the bug this file exists to prevent a
     * second time. A hash-source only counts as one when quoted; bare, it parses
     * as a *host* expression instead — which browsers silently accept when the
     * base64 happens to look like a hostname and reject as invalid when it
     * contains a `+`. Either way the inline script is blocked, and only half the
     * mistake reaches the console.
     */
    const hash = hashInlineScript("console.log('x')");

    expect(hash.startsWith("'sha256-")).toBe(true);
    expect(hash.endsWith("'")).toBe(true);
  });
});

describe('collectScriptHashes', () => {
  it('deduplicates the scripts every page shares', () => {
    // Both pages carry the same theme bootstrap and the same JSON-LD; the CSP
    // should name each body once, not once per page.
    const page = '<script>a</script><script>b</script>';

    expect(collectScriptHashes([page, page])).toHaveLength(2);
  });

  it('sorts, so the same build writes the same header', () => {
    const hashes = collectScriptHashes(['<script>b</script><script>a</script>']);

    expect(hashes).toEqual([...hashes].sort());
  });

  it('returns nothing when there is nothing inline to name', () => {
    expect(collectScriptHashes(['<script src="/entry.js"></script>'])).toEqual([]);
  });
});

describe('the placeholder', () => {
  it('is what public/_headers actually carries', () => {
    // Guards against renaming the constant without touching the template, which
    // would make the substitution silently find nothing to replace.
    expect(SCRIPT_HASH_PLACEHOLDER).toBe('{{SCRIPT_HASHES}}');
  });
});
