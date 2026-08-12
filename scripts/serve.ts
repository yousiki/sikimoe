/**
 * Minimal static file server for `dist/`, used by Playwright and by
 * `bun run serve` for a local look at the production build.
 *
 * `astro preview` daemonises itself, which a process supervisor such as
 * Playwright's `webServer` cannot manage — this stays in the foreground.
 *
 * It also applies `dist/_headers`. Cloudflare is what reads that file in
 * production, so without this every mistake in it — a Content-Security-Policy
 * that blocks the site's own theme bootstrap, say — would stay invisible until
 * after a deploy. See scripts/build-headers.ts, which generates the CSP hashes
 * that this is the only local way to check.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';

import { SCRIPT_HASH_PLACEHOLDER } from './lib/csp';

const ROOT = join(process.cwd(), 'dist');
const PORT = Number(process.env['PORT'] ?? process.argv[2] ?? 4321);

if (!existsSync(ROOT)) {
  console.error(`No build found at ${ROOT}. Run \`bun run build\` first.`);
  process.exit(1);
}

/** One `_headers` block: the paths it matches and the headers it contributes. */
interface HeaderRule {
  readonly matches: RegExp;
  readonly headers: readonly (readonly [string, string])[];
}

/** `/_astro/*` → a regex in which `*` is the only surviving metacharacter. */
const patternToRegExp = (pattern: string): RegExp =>
  new RegExp(
    `^${pattern
      .split('*')
      .map((literal) => literal.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*')}$`,
  );

/**
 * Parses the subset of Cloudflare's `_headers` syntax this site uses: a path
 * pattern at column zero, its headers indented beneath it, `#` for comments.
 * `*` is the only wildcard in play; `:placeholder` segments are left out because
 * nothing here uses them.
 */
const parseHeaderRules = (source: string): HeaderRule[] => {
  const rules: { pattern: string; headers: [string, string][] }[] = [];

  for (const line of source.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    // Column zero starts a new block; anything indented belongs to the last one.
    if (!/^\s/.test(line)) {
      rules.push({ pattern: trimmed, headers: [] });
      continue;
    }

    const separator = trimmed.indexOf(':');
    const current = rules.at(-1);
    if (separator === -1 || !current) continue;
    current.headers.push([trimmed.slice(0, separator).trim(), trimmed.slice(separator + 1).trim()]);
  }

  return rules.map(({ pattern, headers }) => ({ headers, matches: patternToRegExp(pattern) }));
};

const headerFile = join(ROOT, '_headers');
const rules = existsSync(headerFile) ? parseHeaderRules(readFileSync(headerFile, 'utf8')) : [];

if (rules.length === 0) {
  console.warn(`No _headers found in ${ROOT} — serving without the production headers.`);
} else if (
  rules.some((rule) => rule.headers.some(([, value]) => value.includes(SCRIPT_HASH_PLACEHOLDER)))
) {
  console.warn(
    `dist/_headers still contains ${SCRIPT_HASH_PLACEHOLDER} — run \`bun run build\` rather ` +
      'than `astro build`, so scripts/build-headers.ts substitutes the inline-script hashes.',
  );
}

/**
 * The headers production would send for `pathname`. Rules apply in file order
 * and a later one wins, which is how Cloudflare layers overlapping blocks.
 */
const headersFor = (pathname: string): Headers => {
  const headers = new Headers();

  for (const rule of rules) {
    if (!rule.matches.test(pathname)) continue;
    for (const [name, value] of rule.headers) headers.set(name, value);
  }

  /*
   * The one deliberate divergence from production: `_astro/*` and the fonts are
   * cached for a year there, which during a local review shows up as edits that
   * appear not to have happened. Security headers are the reason for applying
   * this file at all; caching is not, so it is overridden rather than mirrored.
   */
  headers.set('Cache-Control', 'no-store');

  return headers;
};

/** Resolves a URL path to a file inside `dist`, or null if it escapes the root. */
const resolve = (pathname: string): string | null => {
  const decoded = decodeURIComponent(pathname);
  const candidate = normalize(join(ROOT, decoded));
  if (!candidate.startsWith(ROOT)) return null;

  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;

  const asDirectoryIndex = join(candidate, 'index.html');
  if (existsSync(asDirectoryIndex)) return asDirectoryIndex;

  const asHtml = `${candidate.replace(/\/$/, '')}.html`;
  if (existsSync(asHtml)) return asHtml;

  return null;
};

const server = Bun.serve({
  port: PORT,
  hostname: '127.0.0.1',
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const file = resolve(pathname);

    if (file) {
      return new Response(Bun.file(file), { headers: headersFor(pathname) });
    }

    const notFound = join(ROOT, '404.html');
    const headers = headersFor(pathname);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    return new Response(existsSync(notFound) ? Bun.file(notFound) : 'Not found', {
      status: 404,
      headers,
    });
  },
});

console.warn(`Serving ${ROOT} at http://${server.hostname}:${server.port}`);
