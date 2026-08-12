/**
 * Substitutes the inline-script hashes into `dist/_headers` after a build.
 *
 * `public/_headers` cannot hold the hashes itself: they change whenever the
 * theme bootstrap in `BaseHead.astro` or the JSON-LD derived from
 * `src/data/profile.ts` changes, and a hash that has fallen a character behind
 * fails in the worst available way — the browser blocks the very script the CSP
 * was written to admit, and the site paints the wrong palette before correcting
 * itself. So the template carries a placeholder and this fills it in from the
 * HTML that was actually emitted.
 *
 * `bun run build` runs this last, after Astro has copied `public/_headers` into
 * `dist/`. Cloudflare reads the copy in `dist/`; the template is never served.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { collectScriptHashes, SCRIPT_HASH_PLACEHOLDER } from './lib/csp';

const DIST = join(process.cwd(), 'dist');
const HEADERS = join(DIST, '_headers');

function stop(reason: string): never {
  console.error(`headers: ${reason}`);
  process.exit(1);
}

/** Every `.html` file under `dist/`, at any depth. */
const htmlFiles = (dir: string): string[] => {
  const found: string[] = [];

  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) found.push(...htmlFiles(path));
    else if (entry.endsWith('.html')) found.push(path);
  }

  return found;
};

if (!statSync(DIST, { throwIfNoEntry: false })?.isDirectory()) {
  stop(`no build at ${DIST} — run \`astro build\` first`);
}

if (!statSync(HEADERS, { throwIfNoEntry: false })?.isFile()) {
  stop('dist/_headers is missing — public/_headers should have been copied into the build');
}

const template = readFileSync(HEADERS, 'utf8');

if (!template.includes(SCRIPT_HASH_PLACEHOLDER)) {
  stop(
    `public/_headers has no ${SCRIPT_HASH_PLACEHOLDER} to substitute. ` +
      'Without it the deployed CSP would name no inline script and block the theme bootstrap.',
  );
}

const pages = htmlFiles(DIST);
if (pages.length === 0) stop('the build emitted no HTML');

const hashes = collectScriptHashes(pages.map((page) => readFileSync(page, 'utf8')));

/*
 * Zero hashes means either the extraction broke or the inline scripts went away.
 * The first is a bug and the second is a deliberate change to `BaseHead.astro`;
 * either way, silently writing a CSP with an empty `script-src` slot is worse
 * than refusing to write one.
 */
if (hashes.length === 0) {
  stop(
    `found no inline <script> in ${pages.length} page(s). ` +
      'If BaseHead.astro genuinely stopped emitting one, drop the placeholder from public/_headers.',
  );
}

writeFileSync(HEADERS, template.replaceAll(SCRIPT_HASH_PLACEHOLDER, hashes.join(' ')));

console.warn(
  `headers: hashed ${hashes.length} inline script(s) from ${pages.length} page(s) into ` +
    `${relative(process.cwd(), HEADERS)}`,
);
