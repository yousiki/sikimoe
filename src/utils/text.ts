/** Text helpers shared by the Astro components. */

const ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (c) => ESCAPES[c]!);

/**
 * Renders the only piece of markup the profile copy uses: `**bold**`.
 *
 * The input is escaped first, so the result is safe to pass to `set:html` even
 * though the source is authored by hand today.
 */
export const emphasise = (value: string): string =>
  escapeHtml(value).replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink font-medium">$1</strong>');

/**
 * Formats an author list for display, marking the site owner.
 * Returns segments rather than a string so the component controls the markup.
 */
export interface AuthorSegment {
  readonly name: string;
  readonly isSelf: boolean;
}

export const authorSegments = (authors: readonly string[], self: string): AuthorSegment[] =>
  authors.map((name) => ({
    name,
    // `Siqi Yang*` still refers to the same person as `Siqi Yang`.
    isSelf: name.replace(/\*+$/, '') === self,
  }));

/** `2018.09` → `2018`; `Present` is passed through. */
export const yearOf = (value: string): string => value.split('.')[0] ?? value;

/** Compact range label for the timeline, e.g. `2022 — 2027`, or just `2019`. */
export const rangeLabel = (start: string, end: string): string => {
  const from = yearOf(start);
  const to = end === 'Present' ? 'Now' : yearOf(end);
  return from === to ? from : `${from} — ${to}`;
};
