import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const globalCss = readFileSync('src/styles/global.css', 'utf8');
const header = readFileSync('src/components/Header.astro', 'utf8');
const hero = readFileSync('src/components/sections/Hero.astro', 'utf8');
const menu = readFileSync('src/scripts/menu.ts', 'utf8');

const containerPage = /@utility container-page\s*\{([\s\S]*?)\n\}/.exec(globalCss)?.[1] ?? '';
const menuRule = /\.menu\s*\{([^}]*)\}/.exec(header)?.[1] ?? '';
const shortLandscape =
  /@media \(height < 40rem\) and \(orientation: landscape\)\s*\{([\s\S]*?)\n {2}\}/.exec(
    hero,
  )?.[1] ?? '';
const shortPortrait =
  /@media \(height < 44rem\) and \(orientation: portrait\)\s*\{([\s\S]*?)\n {2}\}/.exec(
    hero,
  )?.[1] ?? '';

describe('mobile viewport contracts', () => {
  it('keeps the fixed header below the top cutout', () => {
    expect(header).toMatch(/header[^{}]*\{[^}]*padding-top:\s*env\(safe-area-inset-top\)/s);
  });

  it('keeps page content inside both landscape safe edges', () => {
    expect(containerPage).toContain('env(safe-area-inset-left)');
    expect(containerPage).toContain('env(safe-area-inset-right)');
    expect(containerPage.match(/max\(/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it('keeps the scrollable menu above the home indicator', () => {
    expect(menuRule).toContain('env(safe-area-inset-bottom)');
  });

  it('makes the section index modal and removes its background from interaction', () => {
    expect(header).toContain('role="dialog"');
    expect(header).toContain('aria-modal="true"');
    expect(menu).toContain('element.inert = open');
    expect(menu).toContain("toggle.setAttribute('aria-label'");
  });

  it('clips accidental page-wide horizontal overflow', () => {
    expect(globalCss).toMatch(/\n\s*body\s*\{[^}]*overflow-x:\s*clip/s);
  });

  it('removes the redundant scroll cue when a portrait browser is too short', () => {
    expect(shortPortrait).toMatch(/\.hero__scroll\s*\{[^}]*display:\s*none/s);
  });

  it('compresses the hero, including its footer, on short landscape screens', () => {
    // Measured against both Safari's 734 x 343 browser viewport and the full
    // 852 x 393 standalone viewport with native safe-area emulation.
    expect(shortLandscape).toContain('padding-top: calc(4.5rem + env(safe-area-inset-top));');
    expect(shortLandscape).toContain('padding-bottom: max(1rem, env(safe-area-inset-bottom));');
    expect(shortLandscape).toMatch(
      /\.hero__middle\s*\{[^}]*gap:\s*0\.5rem[^}]*padding-block:\s*0/s,
    );
    expect(shortLandscape).toMatch(
      /\.hero__name\s*\{[^}]*font-size:\s*clamp\(2\.8rem, 13vh, 5rem\)/s,
    );
    expect(shortLandscape).toMatch(/\.hero-intro p\s*\{[^}]*font-size:\s*1rem/s);
    expect(shortLandscape).toMatch(/\.hero__footer\s*\{[^}]*gap:\s*1rem/s);
  });
});
