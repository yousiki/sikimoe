/**
 * Regenerates the static social card and the raster icons.
 *
 * The card is screenshotted from the real `/og` route rather than drawn by
 * hand, so it always uses the same fonts, palette and spike field as the site.
 * Run `bun run build` first, then `bun run assets`. The outputs are committed.
 */
import { existsSync, statSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';

import { chromium } from '@playwright/test';
import sharp from 'sharp';

const ROOT = join(process.cwd(), 'dist');
const PUBLIC = join(process.cwd(), 'public');
const PORT = 4399;

if (!existsSync(ROOT)) {
  console.error('No build found in dist/. Run `bun run build` first.');
  process.exit(1);
}

const resolve = (pathname: string): string | null => {
  const candidate = normalize(join(ROOT, decodeURIComponent(pathname)));
  if (!candidate.startsWith(ROOT)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  const index = join(candidate, 'index.html');
  return existsSync(index) ? index : null;
};

const server = Bun.serve({
  port: PORT,
  hostname: '127.0.0.1',
  fetch(request) {
    const file = resolve(new URL(request.url).pathname);
    return file ? new Response(Bun.file(file)) : new Response('Not found', { status: 404 });
  },
});

console.warn('Rendering /og …');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});

await page.goto(`http://127.0.0.1:${PORT}/og`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
// Let the sensor accumulate enough spikes for the field to be legible.
await page.waitForTimeout(2500);

const card = page.locator('[data-og-card]');
const png = await card.screenshot({ type: 'png' });
await browser.close();
await server.stop(true);

// Downsample the 2× capture to exactly 1200×630 — sharper than rendering at 1×.
await sharp(png)
  .resize(1200, 630, { fit: 'fill' })
  .png({ quality: 92 })
  .toFile(join(PUBLIC, 'og.png'));
console.warn('wrote public/og.png');

const favicon = await readFile(join(PUBLIC, 'favicon.svg'));

const rasters = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'favicon-32.png', size: 32 },
] as const;

for (const raster of rasters) {
  await sharp(favicon, { density: 512 })
    .resize(raster.size, raster.size)
    .png()
    .toFile(join(PUBLIC, raster.name));
  console.warn(`wrote public/${raster.name}`);
}

// A 32×32 single-image ICO, for the handful of clients that still ask for one.
const icoPixels = await sharp(favicon, { density: 512 }).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette size
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(icoPixels.length, 14);
header.writeUInt32LE(22, 18); // offset of the image data
await writeFile(join(PUBLIC, 'favicon.ico'), Buffer.concat([header, icoPixels]));
console.warn('wrote public/favicon.ico');
