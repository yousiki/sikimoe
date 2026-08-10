/**
 * Vendors the CV PDFs from the companion `resume` repository into `public/cv/`.
 *
 * The site links its own copies rather than GitHub's: the resume repository is
 * private, so its release assets 404 for every visitor. `public/cv/` is
 * committed for the same reason `public/og.png` is — a build with no credentials
 * (CI, a fork, a fresh clone) still ships a working CV.
 *
 * `bun run build` runs this first. A sync that cannot reach the release is a
 * warning as long as every file is already vendored, and an error otherwise;
 * `SKIP_CV_SYNC=1` skips it outright.
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

import { profile } from '../src/data/profile';

const REPO = 'yousiki/resume';
const PUBLIC = join(process.cwd(), 'public');

/** Remote asset name ← edition id; local path ← the href the site renders. */
const targets = profile.cv.map((edition) => ({
  asset: `resume-${edition.id}.pdf`,
  path: join(PUBLIC, edition.href),
  href: edition.href,
}));

const vendored = targets.every((target) => existsSync(target.path));

/**
 * Missing credentials must not break a build that already has the PDFs — but it
 * must break one that does not, rather than quietly deploying dead links.
 */
function stop(reason: string): never {
  if (vendored) {
    console.warn(`cv: ${reason}`);
    console.warn('cv: keeping the copies already in public/cv/');
    process.exit(0);
  }

  console.error(`cv: ${reason}`);
  console.error(
    `cv: ${REPO} is private — export CV_GITHUB_TOKEN, or run \`gh auth login\`, ` +
      'then try again. `SKIP_CV_SYNC=1` builds without the CV.',
  );
  process.exit(1);
}

/** A developer machine authenticates through `gh`; CI through the environment. */
const resolveToken = (): string | undefined => {
  const fromEnv = process.env['CV_GITHUB_TOKEN'] ?? process.env['GITHUB_TOKEN'];
  if (fromEnv) return fromEnv;

  try {
    const gh = Bun.spawnSync(['gh', 'auth', 'token']);
    const token = gh.success ? gh.stdout.toString().trim() : '';
    return token || undefined;
  } catch {
    return undefined;
  }
};

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');

interface ReleaseAsset {
  readonly id: number;
  readonly name: string;
  /** `sha256:…`, as published by the API. Absent on older releases. */
  readonly digest?: string | null;
}

if (process.env['SKIP_CV_SYNC']) {
  console.warn('cv: SKIP_CV_SYNC is set, leaving public/cv/ untouched');
  process.exit(0);
}

const headers: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'siki.moe build',
};

const token = resolveToken();
if (token) headers['Authorization'] = `Bearer ${token}`;

const release = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
  headers,
}).catch(() => null);

if (!release || !release.ok) {
  stop(
    `could not read the latest release of ${REPO} (${release ? release.status : 'no response'})`,
  );
}

const { tag_name: tag, assets = [] } = (await release.json()) as {
  readonly tag_name?: string;
  readonly assets?: readonly ReleaseAsset[];
};

console.warn(`cv: syncing from ${REPO} ${tag ?? 'latest'}`);

for (const target of targets) {
  const asset = assets.find((candidate) => candidate.name === target.asset);
  if (!asset) stop(`the release has no asset named ${target.asset}`);

  const expected = asset.digest?.replace(/^sha256:/, '');
  const local = existsSync(target.path) ? await readFile(target.path) : null;

  if (local && expected && sha256(local) === expected) {
    console.warn(`cv: ${target.href} is current`);
    continue;
  }

  // `Accept: octet-stream` answers with a redirect to a pre-signed URL that
  // rejects an Authorization header of its own, so the hop is taken by hand.
  const response = await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${asset.id}`, {
    headers: { ...headers, Accept: 'application/octet-stream' },
    redirect: 'manual',
  });

  const location = response.headers.get('location');
  const download = location ? await fetch(location) : response;

  if (!download.ok) stop(`could not download ${target.asset} (${download.status})`);

  const bytes = new Uint8Array(await download.arrayBuffer());

  // Two ways a "successful" download is not the PDF: a truncated body, or an
  // error page served with a 200. Both would ship silently.
  if (expected && sha256(bytes) !== expected) {
    stop(`${target.asset} does not match the digest the release publishes`);
  }
  if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
    stop(`${target.asset} is not a PDF`);
  }

  await mkdir(dirname(target.path), { recursive: true });
  await writeFile(target.path, bytes);
  const size = (bytes.byteLength / 1024).toFixed(0);
  console.warn(`cv: wrote ${relative(process.cwd(), target.path)} (${size} kB)`);
}
