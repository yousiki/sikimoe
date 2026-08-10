/**
 * Minimal static file server for `dist/`, used by Playwright and by
 * `bun run serve` for a local look at the production build.
 *
 * `astro preview` daemonises itself, which a process supervisor such as
 * Playwright's `webServer` cannot manage — this stays in the foreground.
 */
import { existsSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'dist');
const PORT = Number(process.env['PORT'] ?? process.argv[2] ?? 4321);

if (!existsSync(ROOT)) {
  console.error(`No build found at ${ROOT}. Run \`bun run build\` first.`);
  process.exit(1);
}

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
      return new Response(Bun.file(file), {
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const notFound = join(ROOT, '404.html');
    return new Response(existsSync(notFound) ? Bun.file(notFound) : 'Not found', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  },
});

console.warn(`Serving ${ROOT} at http://${server.hostname}:${server.port}`);
