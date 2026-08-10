import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/**
 * `public/_headers` is applied by Cloudflare, so a mistake in it is invisible to
 * `bun run serve` and to every local browser test — it only shows up once the
 * site is deployed. These assertions stand in for that gap.
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

  it('still refuses third-party script and framing', () => {
    expect(directives.get('script-src')?.filter((v) => v.startsWith('http'))).toEqual([]);
    expect(directives.get('frame-ancestors')).toEqual(["'none'"]);
    expect(directives.get('object-src')).toEqual(["'none'"]);
  });

  it('defines a default-src to fall back to', () => {
    expect(directives.get('default-src')).toEqual(["'self'"]);
  });
});
