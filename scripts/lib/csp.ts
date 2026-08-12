/**
 * Hashes the inline `<script>` blocks in the built HTML, so the
 * Content-Security-Policy in `public/_headers` can name them one by one instead
 * of opening `script-src` up to `'unsafe-inline'`.
 *
 * Shared by `scripts/build-headers.ts`, which substitutes the hashes into
 * `dist/_headers`, and by `tests/unit/csp.test.ts`, which pins the extraction
 * against hand-written HTML. Both need the same answer, so neither owns it.
 *
 * A hash has to match the script body byte for byte, so nothing here trims,
 * normalises newlines, or reformats: whatever sits between the tags is what
 * gets hashed.
 */

import { createHash } from 'node:crypto';

/** The token `public/_headers` carries where the hashes belong. */
export const SCRIPT_HASH_PLACEHOLDER = '{{SCRIPT_HASHES}}';

/*
 * Attribute values in this site's markup never contain `>`, so a regex is enough
 * and saves pulling in an HTML parser. The body match is lazy, so it stops at
 * the first closing tag rather than swallowing everything up to the last one.
 */
const SCRIPT_ELEMENT = /<script([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const HAS_SRC_ATTRIBUTE = /\ssrc\s*=/i;

/**
 * Every inline script body in `html`, in document order, including duplicates.
 *
 * Elements carrying `src` are left out: they are external, and `script-src`
 * admits them by origin rather than by hash. `type` is ignored on purpose —
 * a `application/ld+json` block never executes, but browsers still hold it to
 * `script-src`, so it needs a hash exactly like an executable one.
 */
export const extractInlineScripts = (html: string): string[] => {
  const bodies: string[] = [];

  for (const match of html.matchAll(SCRIPT_ELEMENT)) {
    const [, attributes = '', body = ''] = match;
    if (HAS_SRC_ATTRIBUTE.test(attributes)) continue;
    if (body === '') continue;
    bodies.push(body);
  }

  return bodies;
};

/**
 * One script body as the source expression CSP expects.
 *
 * The surrounding single quotes are not decoration — a hash-source is only a
 * hash-source when quoted. Left bare, `sha256-abc…` is parsed as a *host*
 * instead: browsers quietly accept the ones that happen to look like a hostname
 * and reject the ones containing base64's `+` as an invalid source, so roughly
 * half the mistake is silent and the inline script is blocked either way.
 */
export const hashInlineScript = (body: string): string =>
  `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;

/**
 * The deduplicated hashes for a set of HTML documents, sorted so that the same
 * build always produces the same `_headers` line.
 */
export const collectScriptHashes = (documents: string[]): string[] => {
  const hashes = new Set<string>();

  for (const html of documents) {
    for (const body of extractInlineScripts(html)) {
      hashes.add(hashInlineScript(body));
    }
  }

  return [...hashes].sort();
};
