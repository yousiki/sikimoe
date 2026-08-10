/**
 * Site-level constants. Kept free of imports so `astro.config.ts` can read
 * `SITE_URL` without pulling the rest of the content graph into the config.
 */

export const SITE_URL = 'https://siki.moe';

export const SITE_TITLE = 'Siki';

export const SITE_DESCRIPTION =
  'Ph.D. candidate at Peking University working on neuromorphic imaging, video generation, and world models.';

export const SITE_LOCALE = 'en';

/** OpenGraph card, committed to `public/` by `bun run assets`. */
export const SITE_OG_IMAGE = '/og.png';
