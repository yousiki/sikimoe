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
| Tests     | Vitest (units) · Playwright (Chromium + WebKit e2e, plus screenshot capture)                                                                |
| Hosting   | Cloudflare Pages                                                                                                                            |

Total shipped JavaScript is one ~30 kB gzipped module; the page renders and reads
completely without it.

## Getting started

```bash
bun install
bun run dev          # http://localhost:4321
```

### Everyday commands

| Command            | What it does                                    |
| ------------------ | ----------------------------------------------- |
| `bun run dev`      | Dev server with HMR                             |
| `bun run build`    | Static build into `dist/`                       |
| `bun run serve`    | Serve `dist/` exactly as it will ship           |
| `bun run check`    | `astro check` — types across `.ts` and `.astro` |
| `bun run lint`     | ESLint 10, flat config                          |
| `bun run format`   | Prettier                                        |
| `bun run test`     | Vitest unit tests                               |
| `bun run test:e2e` | Playwright, Chromium + mobile WebKit            |
| `bun run shots`    | Write review screenshots to `screenshots/`      |
| `bun run assets`   | Regenerate `public/og.png` and the icons        |
| `bun run verify`   | Everything above that can fail CI, in order     |

First Playwright run only:

```bash
bunx playwright install chromium webkit
```

## Editing the content

Everything is in `src/data/profile.ts`: bio, research interests, timeline,
publications, awards, skills, links. It is fully typed, and the unit tests assert
the invariants that the layout quietly depends on — the timeline is
reverse-chronological, every publication lists the author, every link is absolute
and HTTPS, equal-contribution asterisks come with a matching note. Adding a paper
is one object in the `publications` array; set `selected: true` to surface it
before the "show all" toggle.

Regenerate the social card after changing the name, role, or palette:

```bash
bun run assets
```

It screenshots the real `/og` route, so the card can never drift from the site.

## Accessibility and motion

- Single `<h1>`, ordered headings, skip link, visible focus rings.
- `prefers-reduced-motion: reduce` disables Lenis, the pointer effects, the
  marquee, the character stagger, and the spike animation; all content renders
  immediately. This is covered by an e2e test.
- Theme is an explicit choice stored in `localStorage`, resolved by a blocking
  inline script before first paint, and falls back to the OS preference.
- The full-screen index on narrow viewports traps focus and returns it to its
  trigger on close.

## Deployment

The site is static: `dist/` can be served by anything. In practice it is
[Cloudflare Pages](https://pages.cloudflare.com), with two projects:

| Project            | URL                                  | When                                               |
| ------------------ | ------------------------------------ | -------------------------------------------------- |
| `siki-moe-preview` | `https://siki-moe-preview.pages.dev` | Pushes to `redesign`, and `bun run deploy:preview` |
| `sikimoe`          | `https://siki.moe`                   | Manual `workflow_dispatch` only                    |

Production is intentionally never deployed automatically — see the comment at the
top of [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) for the
one-line change that makes `main` publish to it.

Deploy a preview from your machine:

```bash
bun run build
bun run deploy:preview
```

CI (`.github/workflows/ci.yml`) runs format, lint, typecheck, unit tests, build,
and the browser suite on every push and pull request.

`public/_headers` sets a strict Content-Security-Policy and immutable caching for
fingerprinted assets; Cloudflare Pages applies it at the edge.

## Licence

[MIT](LICENSE) for the code. The written content, photograph, and CV data are
© Siqi Yang.
