import { describe, expect, it } from 'vitest';

import { authorSegments, emphasise, escapeHtml, rangeLabel, yearOf } from '../../src/utils/text';

describe('escapeHtml', () => {
  it('neutralises every character that could open a tag or attribute', () => {
    expect(escapeHtml(`<img src=x onerror="alert('1')">&`)).toBe(
      '&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt;&amp;',
    );
  });
});

describe('emphasise', () => {
  it('converts **bold** runs into strong elements', () => {
    expect(emphasise('a **spike camera** fires')).toBe(
      'a <strong class="text-ink font-medium">spike camera</strong> fires',
    );
  });

  it('handles several runs in one paragraph', () => {
    const html = emphasise('**one** and **two**');
    expect(html.match(/<strong/g)).toHaveLength(2);
  });

  it('escapes before emphasising, so markup in the source cannot survive', () => {
    expect(emphasise('**<script>**')).toBe(
      '<strong class="text-ink font-medium">&lt;script&gt;</strong>',
    );
  });

  it('leaves an unpaired asterisk alone', () => {
    expect(emphasise('2 * 3 = 6')).toBe('2 * 3 = 6');
  });
});

describe('yearOf', () => {
  it('takes the year from a dotted date', () => {
    expect(yearOf('2022.09')).toBe('2022');
  });

  it('passes through a value that is already a year', () => {
    expect(yearOf('2019')).toBe('2019');
  });
});

describe('rangeLabel', () => {
  it('renders an open-ended range as "Now"', () => {
    expect(rangeLabel('2025.12', 'Present')).toBe('2025 — Now');
  });

  it('renders a multi-year range with both ends', () => {
    expect(rangeLabel('2022.09', '2027.07')).toBe('2022 — 2027');
  });

  it('collapses a range that starts and ends in the same year', () => {
    expect(rangeLabel('2019.05', '2019.08')).toBe('2019');
  });
});

describe('authorSegments', () => {
  it('marks the site owner', () => {
    const segments = authorSegments(['Bohan Yu', 'Siqi Yang', 'Boxin Shi'], 'Siqi Yang');
    expect(segments.map((s) => s.isSelf)).toEqual([false, true, false]);
  });

  it('still matches when an equal-contribution asterisk is attached', () => {
    const segments = authorSegments(['Siqi Yang*', 'Chu Zhou*'], 'Siqi Yang');
    expect(segments[0]?.isSelf).toBe(true);
    expect(segments[1]?.isSelf).toBe(false);
    // The asterisk stays in the rendered name — it is what the note refers to.
    expect(segments[0]?.name).toBe('Siqi Yang*');
  });
});
