import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('renders the identity and the section structure', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Siqi Yang/);
    await expect(page.locator('h1')).toContainText('Siqi');
    await expect(page.locator('h1')).toContainText('Yang');

    for (const id of ['about', 'focus', 'path', 'work', 'recognition', 'toolkit', 'contact']) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test('exposes exactly one h1 and no heading level is skipped', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveCount(1);

    const levels = await page
      .locator('h1, h2, h3')
      .evaluateAll((nodes) => nodes.map((n) => Number(n.tagName[1])));

    let previous = 0;
    for (const level of levels) {
      expect(level - previous).toBeLessThanOrEqual(1);
      previous = level;
    }
  });

  test('loads without console errors or failed requests', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) =>
      problems.push(`request: ${request.url()} ${request.failure()?.errorText}`),
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(problems).toEqual([]);
  });

  test('never scrolls horizontally', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('reveals every section once scrolled through', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.5;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
    });
    await expect
      .poll(() => page.locator('[data-reveal]:not([data-revealed])').count(), { timeout: 10_000 })
      .toBe(0);
  });
});

test.describe('theme', () => {
  test('toggles, persists across reloads, and repaints the background', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', /^(dark|light)$/);

    const before = await html.getAttribute('data-theme');
    const beforeBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);

    await page.locator('[data-theme-toggle]').first().click();

    const after = before === 'dark' ? 'light' : 'dark';
    await expect(html).toHaveAttribute('data-theme', after);

    // `body` cross-fades over 0.5s, so this has to retry rather than sample once.
    await expect(page.locator('body')).not.toHaveCSS('background-color', beforeBg);

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', after);
  });

  test('shows one glyph only, and it is the theme the press would give', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    const sun = page.locator('[data-theme-toggle] .theme-icon--sun');
    const moon = page.locator('[data-theme-toggle] .theme-icon--moon');
    const opacityOf = (l: typeof sun) => l.evaluate((el) => Number(getComputedStyle(el).opacity));

    // Dark now, so pressing yields light: the sun is the one on show.
    await expect.poll(() => opacityOf(sun)).toBe(1);
    await expect.poll(() => opacityOf(moon)).toBe(0);

    // Both glyphs occupy the same centred box, so only one is ever legible.
    const box = await page.locator('[data-theme-toggle]').boundingBox();
    for (const glyph of [sun, moon]) {
      const g = await glyph.boundingBox();
      expect(g, 'glyph should be laid out').toBeTruthy();
      if (!g || !box) continue;
      expect(Math.abs(g.x + g.width / 2 - (box.x + box.width / 2))).toBeLessThan(1.5);
      expect(Math.abs(g.y + g.height / 2 - (box.y + box.height / 2))).toBeLessThan(1.5);
    }

    await page.locator('[data-theme-toggle]').first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect.poll(() => opacityOf(sun)).toBe(0);
    await expect.poll(() => opacityOf(moon)).toBe(1);
  });

  test('applies the stored theme before first paint', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('siki-theme', 'light'));
    await page.goto('/');
    // Read the attribute set by the blocking inline script, before hydration.
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('follows the OS preference when nothing has been chosen', async ({ browser }) => {
    for (const scheme of ['dark', 'light'] as const) {
      const context = await browser.newContext({ colorScheme: scheme });
      const page = await context.newPage();
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
      await context.close();
    }
  });
});

test.describe('publications', () => {
  test('expands the full list on request', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('[data-disclosure-toggle]');
    await toggle.scrollIntoViewIfNeeded();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const panel = page.locator('#all-publications');
    await expect(panel).toHaveAttribute('aria-hidden', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toHaveAttribute('aria-hidden', 'false');
    await expect(panel.locator('li').first()).toBeVisible();
  });

  test('links out to the paper, in a new tab, safely', async ({ page }) => {
    await page.goto('/');
    const link = page.locator('#work a[href^="https://arxiv.org"]').first();
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });
});

test.describe('navigation', () => {
  test('in-page anchors move to the target section', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      await page.locator('[data-menu-toggle]').click();
      await expect(page.locator('[data-menu]')).toHaveAttribute('data-open', 'true');
      await page.locator('[data-menu] a[href="#work"]').click();
    } else {
      await page.locator('header a[href="#work"]').click();
    }

    await expect(page).toHaveURL(/#work$/);

    await expect
      .poll(
        () => page.locator('#work').evaluate((el) => Math.abs(el.getBoundingClientRect().top)),
        { timeout: 8_000 },
      )
      .toBeLessThan(140);
  });

  test('the mobile section index opens, navigates and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'the overlay only exists below the md breakpoint');

    await page.goto('/');

    const toggle = page.locator('[data-menu-toggle]');
    const menu = page.locator('[data-menu]');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.locator('a[href="#about"]')).toBeVisible();

    // Escape closes it and hands focus back to the button.
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });

  test('serves a 404 page for unknown paths', async ({ page }) => {
    const response = await page.goto('/definitely-not-a-page');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('404');
  });
});

test.describe('reduced motion', () => {
  test('shows all content immediately and starts no smooth scroller', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
      true,
    );

    await expect(page.locator('h1')).toBeVisible();

    // No transition should be pending: the content is simply there.
    const states = await page.locator('[data-reveal]').evaluateAll((nodes) =>
      nodes.map((n) => ({
        opacity: getComputedStyle(n).opacity,
        transitionDuration: getComputedStyle(n).transitionDuration,
      })),
    );
    expect(states.length).toBeGreaterThan(0);
    for (const state of states) {
      expect(Number(state.opacity)).toBe(1);
    }

    // Lenis marks the document element when it takes over scrolling.
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
  });
});

test.describe('metadata', () => {
  test('publishes canonical, OpenGraph and structured data', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /siki\.moe/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.png$/);

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    const parsed = JSON.parse(jsonLd ?? '{}') as { '@type'?: string; name?: string };
    expect(parsed['@type']).toBe('Person');
    expect(parsed.name).toBe('Siqi Yang');
  });

  test('serves robots.txt pointing at the sitemap', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('sitemap-index.xml');
  });
});
