import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { SCRIPT_HASH_PLACEHOLDER } from '../../scripts/lib/csp';

/**
 * `public/_headers` is applied by Cloudflare, so a mistake in it is invisible to
 * every local browser test — it only shows up once the site is deployed. These
 * assertions stand in for that gap. (`bun run serve` now applies the generated
 * `dist/_headers` too, which covers what a static read of the template cannot.)
 */
const headers = readFileSync('public/_headers', 'utf8');

const csp = (): Map<string, string[]> => {
  const line = headers
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('Content-Security-Policy:'));
  if (!line) throw new Error('no Content-Security-Policy in public/_headers');

  const directives = new Map<string, string[]>();
  for (const part of line.slice('Content-Security-Policy:'.length).split(';')) {
    const [name, ...values] = part.trim().split(/\s+/);
    if (name) directives.set(name, values);
  }
  return directives;
};

describe('content security policy', () => {
  const directives = csp();

  it('allows the data: fonts that Vite inlines', () => {
    // The CJK subset is under Vite's inline limit, so it ships as a data URI
    // inside the stylesheet. Without data: here, Cloudflare blocks the Han
    // typeface and the Chinese name silently falls back to a system serif.
    expect(directives.get('font-src')).toContain('data:');
  });

  it('allows the data: image used for the film grain', () => {
    expect(directives.get('img-src')).toContain('data:');
  });

  it('admits the analytics beacon and nothing else third-party', () => {
    /*
     * Cloudflare Web Analytics is injected into the HTML by the zone, not by this
     * repository (see README § Analytics). Its beacon reports to
     * siki.moe/cdn-cgi/rum, which is why `connect-src` below is first-party only.
     *
     * The *origin*, deliberately, not the `/beacon.min.js` path the Cloudflare
     * docs suggest: automatic injection appends a rotating version segment
     * (`/beacon.min.js/v4513226…`), and a CSP path not ending in `/` must match
     * exactly — so the documented value blocked the beacon in production. Do not
     * "tighten" this back to a path.
     *
     * This started life as "refuses third-party script outright". It is narrowed
     * rather than deleted so it keeps refusing the *second* third-party origin.
     */
    expect(directives.get('script-src')?.filter((v) => v.startsWith('http'))).toEqual([
      'https://static.cloudflareinsights.com',
    ]);
    expect(directives.get('connect-src')).toEqual(["'self'"]);
    expect(directives.get('frame-ancestors')).toEqual(["'none'"]);
    expect(directives.get('object-src')).toEqual(["'none'"]);
  });

  it('names its inline scripts by hash instead of allowing them wholesale', () => {
    // scripts/build-headers.ts substitutes the placeholder at the end of the
    // build. Note that a CSP carrying any hash makes browsers ignore
    // 'unsafe-inline' entirely, so leaving it in would be misleading rather than
    // a safety net.
    expect(directives.get('script-src')).toContain(SCRIPT_HASH_PLACEHOLDER);
    expect(directives.get('script-src')).not.toContain("'unsafe-inline'");
  });

  it('keeps style-src loose, because Astro inlines stylesheets', () => {
    // `inlineStylesheets: 'auto'` in astro.config.ts, plus every component
    // `<style>` block. Not an oversight — the counterpart of the check above.
    expect(directives.get('style-src')).toContain("'unsafe-inline'");
  });

  it('defines a default-src to fall back to', () => {
    expect(directives.get('default-src')).toEqual(["'self'"]);
  });
});

describe('transport security', () => {
  const hsts = headers
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('Strict-Transport-Security:'));

  it('pins HTTPS for at least a year', () => {
    expect(hsts).toBeDefined();
    expect(Number(/max-age=(\d+)/.exec(hsts ?? '')?.[1] ?? 0)).toBeGreaterThanOrEqual(31536000);
  });

  it('binds this hostname only, not every subdomain', () => {
    /*
     * `includeSubDomains` would hold every siki.moe subdomain to HTTPS for the
     * whole max-age, so an HTTP-only one becomes unreachable for a year and the
     * retraction is not quick — the max-age has to be lowered and then waited
     * out. Cloudflare's dashboard guards that with an "I understand" dialog;
     * setting it here would skip the dialog and keep the consequence.
     */
    expect(hsts).not.toContain('includeSubDomains');
  });

  it('stays out of the browser preload list', () => {
    // `preload` submits the domain to a list compiled into browser binaries.
    // Getting back off it takes months, so it is not something to acquire as a
    // side effect of editing a header — it needs its own decision.
    expect(hsts).not.toContain('preload');
  });
});
