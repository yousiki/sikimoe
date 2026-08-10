import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { profile, publicationsByYear, selectedPublications, SELF } from '../../src/data/profile';

describe('profile identity', () => {
  it('uses the same display name the publication list marks as the author', () => {
    expect(profile.name).toBe(SELF);
  });

  it('exposes a mailto social that matches the canonical email', () => {
    const mail = profile.socials.find((s) => s.icon === 'mail');
    expect(mail?.href).toBe(`mailto:${profile.email}`);
  });
});

describe('location', () => {
  it('names a timezone the browser clock can actually format', () => {
    // `Intl` throws on an unknown zone, which would take the hero clock down.
    expect(() => new Intl.DateTimeFormat('en-GB', { timeZone: profile.timezone })).not.toThrow();
  });

  it('is a timezone in the same place the location claims', () => {
    const region = profile.location.split(',').pop()?.trim();
    const zoneCity = profile.timezone.split('/').pop()?.replace(/_/g, ' ');
    const city = profile.location.split(',')[0]?.trim();
    expect(region, 'location should read "City, Country"').toBeTruthy();
    // Not every IANA zone is named after its own city, but ours should be —
    // it is the pairing that goes stale when only one of the two is edited.
    expect(zoneCity).toBe(city);
  });
});

describe('links', () => {
  const hrefs = [
    ...profile.socials.map((s) => s.href),
    ...profile.timeline.flatMap((t) => (t.href ? [t.href] : [])),
    ...publicationsByYear.flatMap((p) => (p.href ? [p.href] : [])),
    profile.affiliationHref,
  ];

  it('are all absolute and parseable', () => {
    for (const href of hrefs) {
      expect(() => new URL(href)).not.toThrow();
    }
  });

  it('never fall back to plain http', () => {
    for (const href of hrefs) {
      expect(new URL(href).protocol).toMatch(/^(https|mailto):$/);
    }
  });
});

describe('cv editions', () => {
  it('offers English, Chinese and the bilingual edition, English first', () => {
    expect(profile.cv.map((edition) => edition.id)).toEqual(['en', 'zh', 'en-zh']);
  });

  it('names every file after the edition it holds', () => {
    // The id is what the menu, the release asset, the vendored file and the
    // Typst entry point all agree on; a drifting href is the failure to catch.
    for (const edition of profile.cv) {
      expect(edition.href, edition.label).toMatch(
        new RegExp(`^/cv/[a-z0-9-]+-${edition.id}\\.pdf$`),
      );
    }
  });

  it('is served by this site, not by a third party', () => {
    // The resume repository is private, so a GitHub release URL 404s for every
    // visitor. This is the regression that put a dead CV link on the site.
    for (const edition of profile.cv) {
      expect(edition.href, edition.label).toMatch(/^\//);
    }
  });

  it('has every edition vendored into public/', () => {
    // `bun run cv` writes these; the build copies `public/` verbatim. A missing
    // file here is a 404 on the deployed site.
    for (const edition of profile.cv) {
      const file = join(process.cwd(), 'public', edition.href);
      expect(existsSync(file), `${file} — run \`bun run cv\``).toBe(true);
      expect(readFileSync(file).subarray(0, 5).toString(), edition.label).toBe('%PDF-');
    }
  });
});

describe('publications', () => {
  it('are sorted newest first', () => {
    const years = publicationsByYear.map((p) => p.year);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });

  it('all list the author among their authors', () => {
    for (const publication of publicationsByYear) {
      const names = publication.authors.map((a) => a.replace(/\*+$/, ''));
      expect(names, publication.title).toContain(SELF);
    }
  });

  it('have unique titles, so the disclosure split cannot duplicate a row', () => {
    const titles = publicationsByYear.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('surface a non-empty selection that is a strict subset', () => {
    expect(selectedPublications.length).toBeGreaterThan(0);
    expect(selectedPublications.length).toBeLessThan(publicationsByYear.length);
  });

  it('note equal contribution whenever an author carries an asterisk', () => {
    for (const publication of publicationsByYear) {
      if (publication.authors.some((a) => a.endsWith('*'))) {
        expect(publication.note, publication.title).toMatch(/equal contribution/i);
      }
    }
  });
});

describe('timeline', () => {
  it('runs from most recent to least recent', () => {
    const starts = profile.timeline.map((t) => t.start);
    expect([...starts].sort().reverse()).toEqual(starts);
  });

  it('uses `YYYY.MM` for every bounded date', () => {
    for (const entry of profile.timeline) {
      expect(entry.start).toMatch(/^\d{4}\.\d{2}$/);
      expect(entry.end === 'Present' || /^\d{4}\.\d{2}$/.test(entry.end)).toBe(true);
    }
  });

  it('contains both education and experience', () => {
    const kinds = new Set(profile.timeline.map((t) => t.kind));
    expect(kinds).toEqual(new Set(['education', 'experience']));
  });
});

describe('interests', () => {
  it('are numbered consecutively from 01', () => {
    expect(profile.interests.map((i) => i.index)).toEqual(
      profile.interests.map((_, n) => String(n + 1).padStart(2, '0')),
    );
  });

  it('never stand in for the research areas', () => {
    // `interests` is hobbies and `researchAreas` is expertise. The social card
    // and schema.org/knowsAbout read the latter; an overlap would mean one of
    // them is pointed at the wrong list.
    const areas = new Set(profile.researchAreas.map((a) => a.toLowerCase()));
    for (const interest of profile.interests) {
      expect(areas.has(interest.title.toLowerCase()), interest.title).toBe(false);
    }
  });
});

describe('research areas', () => {
  it('are non-empty and free of duplicates', () => {
    expect(profile.researchAreas.length).toBeGreaterThan(0);
    expect(new Set(profile.researchAreas).size).toBe(profile.researchAreas.length);
  });

  it('keeps the first three short enough for the social card', () => {
    // og.astro renders three tags on one row; long labels wrap and break it.
    for (const area of profile.researchAreas.slice(0, 3)) {
      expect(area.length, area).toBeLessThanOrEqual(24);
    }
  });
});
