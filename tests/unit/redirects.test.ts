import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/**
 * `public/_redirects` is applied by Cloudflare, and `bun run serve` — unlike
 * `_headers` — does not stand in for it, so nothing local ever exercises these
 * rules. They also point at anchors, which means a renamed section id breaks
 * them silently: the redirect still fires, and lands the visitor at the top of
 * the page instead of the section that replaced the URL they followed.
 */
const source = readFileSync('public/_redirects', 'utf8');

interface Rule {
  readonly from: string;
  readonly to: string;
  readonly status: string;
}

const rules: readonly Rule[] = source
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0 && !line.startsWith('#'))
  .map((line) => {
    const [from, to, status] = line.split(/\s+/);
    if (!from || !to || !status) throw new Error(`unparsable redirect: ${line}`);
    return { from, to, status };
  });

/** Every `id` a section on the page actually declares. */
const sectionIds = new Set(
  readdirSync('src/components/sections')
    .flatMap((file) => [
      ...readFileSync(join('src/components/sections', file), 'utf8').matchAll(
        /<section[^>]*\sid="([^"]+)"/g,
      ),
    ])
    .map((match) => match[1] as string),
);

describe('legacy redirects', () => {
  it('has rules at all', () => {
    // A `_redirects` that parsed to nothing would pass every check below.
    expect(rules.length).toBeGreaterThan(0);
  });

  it('sends every legacy path somewhere that exists on the page', () => {
    for (const rule of rules) {
      const anchor = rule.to.startsWith('/#') ? rule.to.slice(2) : null;
      if (anchor === null) {
        // The only non-anchor destination is the page itself.
        expect(rule.to, `${rule.from} points outside the site`).toBe('/');
        continue;
      }
      expect(sectionIds, `${rule.from} points at #${anchor}, which no section declares`).toContain(
        anchor,
      );
    }
  });

  it('moves everything permanently', () => {
    // These pages are not coming back. A 302 would leave crawlers holding both
    // URLs, which is the state this file exists to end.
    for (const rule of rules) expect(rule.status, rule.from).toBe('301');
  });

  it('catches the trailing slash on every path it catches bare', () => {
    // The old build emitted directory URLs, so `/about/` is at least as likely
    // to be the link someone saved as `/about`. The splat covers it — and the
    // collection entries under it — but only if it was not forgotten.
    const splats = new Set(
      rules.filter((r) => r.from.endsWith('/*')).map((r) => r.from.slice(0, -2)),
    );
    for (const rule of rules) {
      if (rule.from.endsWith('/*') || rule.from.includes('.')) continue;
      expect(splats, `${rule.from} has no ${rule.from}/* companion`).toContain(rule.from);
    }
  });

  it('stays inside the Cloudflare budget for dynamic rules', () => {
    // Static redirects are cheap (2,000 allowed); anything with a splat or a
    // placeholder in it comes out of a pool of 100, and the whole file is
    // dropped rather than truncated when a deploy exceeds it.
    const dynamic = rules.filter((r) => r.from.includes('*') || r.from.includes(':'));
    expect(dynamic.length).toBeLessThan(100);
  });
});
