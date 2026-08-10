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

describe('links', () => {
  const hrefs = [
    ...profile.socials.map((s) => s.href),
    ...profile.timeline.flatMap((t) => (t.href ? [t.href] : [])),
    ...publicationsByYear.flatMap((p) => (p.href ? [p.href] : [])),
    profile.cv.en,
    profile.cv.zh,
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
});
