import { mkdir } from 'node:fs/promises';
import { test, type Page } from '@playwright/test';

/**
 * Not an assertion suite — this captures the reference screenshots used for
 * design review. `bun run shots` writes them to `screenshots/`.
 */

const OUT = 'screenshots';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

const SECTIONS = [
  'top',
  'research',
  'interests',
  'path',
  'publications',
  'recognition',
  'toolkit',
  'contact',
] as const;

const settle = async (page: Page): Promise<void> => {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  // Let the entrance animations and the spike field reach a steady state.
  await page.waitForTimeout(2200);
};

/** Scrolls the whole page once so every IntersectionObserver reveal fires. */
const revealAll = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.6;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 400));
  });
};

for (const viewport of VIEWPORTS) {
  for (const theme of ['dark', 'light'] as const) {
    test(`capture ${viewport.name} ${theme}`, async ({ page }) => {
      test.setTimeout(120_000);
      await mkdir(OUT, { recursive: true });

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.addInitScript((value) => {
        localStorage.setItem('siki-theme', value);
      }, theme);

      await page.goto('/');
      await settle(page);

      await page.screenshot({
        path: `${OUT}/${viewport.name}-${theme}-hero.png`,
      });

      await revealAll(page);

      await page.screenshot({
        path: `${OUT}/${viewport.name}-${theme}-full.png`,
        fullPage: true,
      });

      if (viewport.name === 'mobile') {
        await page.locator('[data-menu-toggle]').click();
        await page.waitForTimeout(700);
        await page.screenshot({ path: `${OUT}/mobile-${theme}-menu.png` });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }

      if (viewport.name === 'desktop') {
        await page.goto('/definitely-not-a-page');
        await settle(page);
        await page.screenshot({ path: `${OUT}/notfound-${theme}.png` });
        await page.goto('/');
        await settle(page);
      }

      if (viewport.name === 'desktop') {
        for (const id of SECTIONS) {
          const section = page.locator(`#${id}`);
          if ((await section.count()) === 0) continue;
          await section.scrollIntoViewIfNeeded();
          await page.waitForTimeout(900);
          await page.screenshot({ path: `${OUT}/section-${id}-${theme}.png` });
        }
      }
    });
  }
}
