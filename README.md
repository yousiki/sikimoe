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
| Type      | Instrument Serif · Geist · Geist Mono, self-hosted via Fontsource; the italic and CJK faces are subset in-repo                              |
| Language  | TypeScript everywhere — including `astro.config.ts`, `eslint.config.ts` and `prettier.config.ts`. There is no `.js` file in this repository |
| Runtime   | [Bun](https://bun.com) for installs, scripts, and the local static server                                                                   |
| Tests     | Vitest (units). Playwright is kept for screenshots only — there is no browser suite                                                         |
| Hosting   | Cloudflare Workers, assets-only — the custom domain lives in `wrangler.jsonc`                                                               |

The page renders and reads completely without JavaScript. What it does ship is
split along the guards the code already had, so nobody downloads an animation
library that could not have run for them:

| Visitor                          | Chunks requested     | gzipped     |
| -------------------------------- | -------------------- | ----------- |
| `prefers-reduced-motion: reduce` | entry + spike canvas | **5.9 kB**  |
| Touch device                     | + Lenis              | **11.3 kB** |
| Pointer-fine desktop             | + Motion             | 32.5 kB     |

The entry module is 3.9 kB; Motion (21.2 kB) and Lenis (5.4 kB) are `import()`ed
_after_ `hasFinePointer()` and `prefersReducedMotion()` have decided whether they
can be used at all. Previously both were static imports, which put all 29.0 kB of
them in the entry module — on the critical path, for every visitor, including the
ones whose device made them unreachable.

A desktop visitor now transfers slightly _more_ in total (32.5 kB against 31.0 kB),
because three chunks compress a little worse than one. That is the trade: the
blocking path shrinks 7.5×, and phones drop by two thirds.

## Getting started

```bash
bun install
bun run dev          # http://localhost:4321
```

### Everyday commands

| Command                | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `bun run dev`          | Dev server with HMR                                 |
| `bun run build`        | Static build into `dist/`                           |
| `bun run serve`        | Serve `dist/` exactly as it will ship               |
| `bun run check`        | `astro check` — types across `.ts` and `.astro`     |
| `bun run lint`         | ESLint 10, flat config                              |
| `bun run format`       | Prettier                                            |
| `bun run test`         | Vitest unit tests                                   |
| `bun run shots`        | Write review screenshots to `screenshots/`          |
| `bun run assets`       | Regenerate `public/og.png` and the icons            |
| `bun run cv`           | Pull the CV PDFs into `public/cv/`                  |
| `bun run fonts:italic` | Rebuild the italic subset after italic text changes |
| `bun run verify`       | Everything above that can fail CI, in order         |

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

## The LCP element

The hero paragraph is the largest thing on the page, so it is what Chrome times
LCP against — and it is the one element on the site that deliberately does _not_
use the `data-reveal` scroll animation. Two properties of that rule each cost
about a second, both measured at 1638 kbps / 150 ms RTT / CPU 4×, median of five
loads:

| Entrance                                | LCP       |
| --------------------------------------- | --------- |
| `data-reveal`, 560 ms delay, 0.9 s fade | 2664 ms   |
| the same with no delay                  | 2516 ms   |
| CSS animation, `opacity: 0 → 1`         | 2504 ms   |
| CSS animation, `opacity: 0.35 → 1`      | **= FCP** |

Chrome will not accept a fully transparent element as an LCP candidate, so a fade
from zero defers LCP until the fade has run. That penalty is a flat ~1100 ms — the
same whether the fade lasts 0.2 s or 0.9 s, and whether the delay is 0 or 560 ms,
which is why shortening either one barely moved it. Starting at 0.35 keeps the
element eligible from its first paint and still reads as a fade. `data-reveal` is
also released by JS, so it waited on the module as well; the replacement is pure
CSS.

`tests/unit/lcp.test.ts` fails if the element goes back to `data-reveal` or if
that 0.35 becomes 0 — neither would break the page, or any other test, or the
build.

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

Its `script-src` names the two inline scripts — the theme bootstrap and the
JSON-LD block — by SHA-256 rather than allowing `'unsafe-inline'`. Those hashes
cannot live in the template, because they change whenever `BaseHead.astro` or
`src/data/profile.ts` does, so `public/_headers` carries a `{{SCRIPT_HASHES}}`
placeholder and [`scripts/build-headers.ts`](scripts/build-headers.ts) substitutes
the real values into `dist/_headers` at the end of every build, reading them out
of the HTML that was actually emitted. It exits non-zero rather than write a
policy with nothing in that slot.

This is worth knowing because of how the failure looks: a CSP carrying any hash
makes browsers ignore `'unsafe-inline'` altogether, so a stale hash does not
degrade to the old permissive policy — it blocks the theme bootstrap, and the site
paints the wrong palette for one frame before correcting itself. Nothing about the
build fails. `bun run serve` therefore applies `dist/_headers` as Cloudflare would,
which makes that class of mistake visible in a local browser console instead of
only in production. Two zone settings can reintroduce it from outside the
repository: **Rocket Loader** and any HTML-minifying feature rewrite inline
scripts after the hashes were computed, so both need to stay off.

## Analytics

Page views and Core Web Vitals come from [Cloudflare Web
Analytics](https://developers.cloudflare.com/web-analytics/), enabled on the
`siki.moe` zone with **automatic injection** — the default when you add a proxied
hostname under Web Analytics in the dashboard. It is the one piece of this site's
configuration that is not in this repository, which is a real cost; it buys three
things that the manual JS snippet does not:

- The beacon reports to `siki.moe/cdn-cgi/rum`, first-party, so `connect-src` in
  the CSP stays `'self'`. A manual snippet reports to `cloudflareinsights.com` and
  would need that origin allowed.
- Cloudflare adds an `integrity` attribute to the injected tag. The docs are
  explicit that manual embeds cannot be given SRI, because the beacon is not
  version-pinned.
- Preview deploys land on `*.workers.dev`, which is not on the zone and so is
  never injected. Because `dist/` is built once in `verify.yml` and handed to both
  the preview and the production deploy, a token committed to the repository would
  necessarily report from previews too.

No cookies, no page-view sampling, and query strings are not logged. The only
trace in this repository is the `static.cloudflareinsights.com` origin in the
`script-src` above.

That is the origin and not the `/beacon.min.js` path the Cloudflare docs suggest,
which is worth knowing before anyone tightens it: automatic injection appends a
rotating version segment (`/beacon.min.js/v4513226…`), and a CSP source whose path
does not end in `/` has to match exactly. The documented value therefore blocks
the beacon — it did, in production, for the few minutes between v2.2.0 and
v2.2.1. A trailing slash is not the fix either, since it would then miss the bare
unversioned URL. `headers.test.ts` pins the origin form.

Two things silently break it. An HTML response carrying `Cache-Control: public,
no-transform` stops the injection outright — so if HTML caching is ever added to
`public/_headers`, leave `no-transform` out of it. And the dashboard's **Manage
site** must stay on automatic rather than "Enable with JS Snippet installation";
the modes are alternatives, and running both would double-count.

## Licence

[MIT](LICENSE) for the code. The written content, photograph, and CV data are
© Siqi Yang.
