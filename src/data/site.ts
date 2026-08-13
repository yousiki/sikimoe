/**
 * Site-level constants. Kept free of imports so `astro.config.ts` can read
 * `SITE_URL` without pulling the rest of the content graph into the config.
 */

export const SITE_URL = 'https://siki.moe';

/*
 * The name first, because the overwhelming majority of queries that reach this
 * site are the name — and because this string is what a bookmark, a shared
 * link, and a recruiter's browser history all keep. The three subjects after it
 * are the ones the page is actually about; a bare `Siki` matched none of them
 * and identified nobody. Long enough that a search result will clip the tail,
 * which costs nothing: the match runs against the whole title either way, and
 * everything load-bearing is in front of the dash.
 */
export const SITE_TITLE = 'Siqi Yang (YouSiki) — Spike Cameras, Video Generation & World Models';

export const SITE_DESCRIPTION =
  'Ph.D. candidate at Peking University working on neuromorphic imaging, video generation, and world models.';

export const SITE_LOCALE = 'en';

/** OpenGraph card, committed to `public/` by `bun run assets`. */
export const SITE_OG_IMAGE = '/og.png';
