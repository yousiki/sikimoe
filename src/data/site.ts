/**
 * Site-level constants. Kept free of imports so `astro.config.ts` can read
 * `SITE_URL` without pulling the rest of the content graph into the config.
 */

export const SITE_URL = 'https://siki.moe';

export const SITE_TITLE = 'Siqi Yang — Computational Photography & Vision';

export const SITE_SHORT_TITLE = 'Siqi Yang';

export const SITE_DESCRIPTION =
  'Ph.D. candidate at Peking University working on neuromorphic imaging, inverse rendering, and video world models.';

export const SITE_LOCALE = 'en';

/** OpenGraph image, generated at build time into `/og.svg`. */
export const SITE_OG_IMAGE = '/og.png';

export const SITE_THEME_COLOR = {
  light: '#f6f4ef',
  dark: '#08080a',
} as const;
