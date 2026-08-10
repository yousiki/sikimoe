# siki.moe

Personal site of **Siqi Yang (杨思祺 / YouSiki)** — Ph.D. candidate at the Camera
Intelligence Lab, Peking University.

One page, no CMS, no blog. Everything the site knows about its subject lives in a
single typed file, [`src/data/profile.ts`](src/data/profile.ts), which mirrors the
CV in the companion [`resume`](https://github.com/yousiki/resume) repository.

## The idea

The hero backdrop is a **simulated spike camera**. Each cell of a virtual sensor
grid integrates the light of a slowly drifting illumination field, and fires the
moment its accumulated charge crosses one unit — the integrate-and-fire behaviour
of the neuromorphic sensors this site's author writes reconstruction algorithms
for. Bright regions fire densely, dark regions stay quiet, and the illumination
becomes visible purely through the statistics of the spikes. It responds to the
pointer, and it draws exactly one settled frame when the visitor has asked for
reduced motion.

## Stack

|           |                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework | [Astro 7](https://astro.build) — fully static output, zero client framework                                                                 |
| Styling   | [Tailwind CSS 4](https://tailwindcss.com) with a CSS-variable palette                                                                       |
| Animation | [Motion](https://motion.dev), [Lenis](https://lenis.darkroom.engineering), CSS, and a hand-written canvas simulation                        |
| Type      | Instrument Serif · Geist · Geist Mono, self-hosted via Fontsource                                                                           |
| Language  | TypeScript everywhere — including `astro.config.ts`, `eslint.config.ts` and `prettier.config.ts`. There is no `.js` file in this repository |
| Runtime   | [Bun](https://bun.com) for installs, scripts, and the local static server                                                                   |
| Tests     | Vitest (units). Playwright is kept for screenshots only — there is no browser suite                                                         |
| Hosting   | Cloudflare Workers, assets-only — the custom domain lives in `wrangler.jsonc`                                                               |

Total shipped JavaScript is one ~30 kB gzipped module; the page renders and reads
completely without it.

## Getting started

```bash
bun install
bun run dev          # http://localhost:4321
```

### Everyday commands

| Command          | What it does                                    |
| ---------------- | ----------------------------------------------- |
| `bun run dev`    | Dev server with HMR                             |
| `bun run build`  | Static build into `dist/`                       |
| `bun run serve`  | Serve `dist/` exactly as it will ship           |
| `bun run check`  | `astro check` — types across `.ts` and `.astro` |
| `bun run lint`   | ESLint 10, flat config                          |
| `bun run format` | Prettier                                        |
| `bun run test`   | Vitest unit tests                               |
| `bun run shots`  | Write review screenshots to `screenshots/`      |
| `bun run assets` | Regenerate `public/og.png` and the icons        |
| `bun run cv`     | Pull the CV PDFs into `public/cv/`              |
| `bun run verify` | Everything above that can fail CI, in order     |

Before the first `shots` or `assets` run, which drive a real browser:

```bash
bunx playwright install chromium
```

## Editing the content

Everything is in `src/data/profile.ts`: bio, research interests, timeline,
publications, awards, skills, links. It is fully typed, and the unit tests assert
the invariants that the layout quietly depends on — the timeline is
reverse-chronological, every publication lists the author, every link is absolute
and HTTPS, equal-contribution asterisks come with a matching note. Adding a paper
is one object in the `publications` array; set `selected: true` to surface it
before the "show all" toggle.

`profile.cv` lists three CV editions — English, 中文, and the bilingual document —
rendered by [`CvMenu.astro`](src/components/CvMenu.astro) in both the header and
the contact section. The site serves its own copies from `public/cv/`, because
the [`resume`](https://github.com/yousiki/resume) repository they are built in is
private and its release assets 404 for visitors:

```bash
bun run cv            # pull the latest release into public/cv/
```

`bun run build` runs it first, so a deploy always ships the newest CV it can
reach. The PDFs are committed, like `public/og.png` — a build with no GitHub
credentials keeps the vendored copies and only warns. `SKIP_CV_SYNC=1` skips the
sync entirely. Authentication is `gh auth login` locally, or a `CV_GITHUB_TOKEN`
repository secret in CI.

Regenerate the social card after changing the name, role, or palette:

```bash
bun run assets
```

It screenshots the real `/og` route, so the card can never drift from the site.

## Accessibility and motion

- Single `<h1>`, ordered headings, skip link, visible focus rings.
- `prefers-reduced-motion: reduce` disables Lenis, the pointer effects, the
  marquee, the character stagger, and the spike animation; all content renders
  immediately.
- Theme is an explicit choice stored in `localStorage`, resolved by a blocking
  inline script before first paint, and falls back to the OS preference.
- The full-screen index on narrow viewports traps focus and returns it to its
  trigger on close.

## Deployment

The site is static: `dist/` can be served by anything. In practice it is a
Cloudflare Worker with [static
assets](https://developers.cloudflare.com/workers/static-assets/) — assets-only,
with no `main`, so no script is ever invoked and no request is billable.

It is a Worker rather than a Pages project for one reason: the custom domain is
declared in [`wrangler.jsonc`](wrangler.jsonc) as a `routes` entry with
`custom_domain: true`, which attaches the hostname and writes the DNS record on
deploy. `siki.moe` is therefore version-controlled rather than a dashboard
setting nobody remembers clicking. Pages has no equivalent field.

GitHub Actions does the deploying — not Workers Builds, which must stay
disconnected from this repository or the two will publish over each other.

| Trigger                  | Workflow      | Command                    | Result                                |
| ------------------------ | ------------- | -------------------------- | ------------------------------------- |
| Pull request             | `ci.yml`      | `wrangler versions upload` | `pr-<n>-siki-moe.yousiki.workers.dev` |
| Push to `main`           | `ci.yml`      | `wrangler versions upload` | `main-siki-moe.yousiki.workers.dev`   |
| GitHub Release published | `release.yml` | `wrangler deploy`          | `siki.moe`                            |

So **`main` no longer publishes**. Only a release does, and only through
`wrangler deploy` — the one command that applies the `routes` entry above.
`wrangler versions upload` has no `--routes`, `--domain` or `--triggers` flag, so
a preview is structurally incapable of touching `siki.moe`; that guarantee comes
from the command rather than from a conditional someone could get wrong.

Both workflows call [`verify.yml`](.github/workflows/verify.yml) first, so a
deploy is gated on the same format, lint, typecheck, test and build run that a
pull request gets, and `dist/` is built exactly once and handed on as an
artifact — the bytes that were verified are the bytes that ship.

`workflow_dispatch` on `release.yml` deploys whichever ref you pick, which is how
the site gets restored when there is no good version to roll back to. To roll
back to one that exists:

```bash
wrangler versions list --name siki-moe
wrangler versions deploy <version-id>@100% -y
```

Two repository secrets are required. `CLOUDFLARE_ACCOUNT_ID`, and a
`CLOUDFLARE_API_TOKEN` holding Workers Scripts: Edit and Account Settings: Read
on the account, plus Workers Routes: Edit and DNS: Edit on the `siki.moe` zone —
the last one because `custom_domain` writes the DNS record itself.

`CV_GITHUB_TOKEN` is optional, and a _build_ secret rather than a runtime one.
Without it the build keeps the CV PDFs committed to `public/cv/` and only warns.

`workers_dev` is off so the site answers on `siki.moe` and nowhere else;
`preview_urls` has to then be turned back on explicitly, because it defaults to
whatever `workers_dev` is. Only `wrangler deploy` writes either setting.

`public/_headers` sets a strict Content-Security-Policy and immutable caching for
fingerprinted assets; Workers parses it rather than serving it, and applies it at
the edge.

## Licence

[MIT](LICENSE) for the code. The written content, photograph, and CV data are
© Siqi Yang.
