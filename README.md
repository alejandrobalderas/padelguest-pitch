# PadelGuest — Pitch Deck (Web Version)

A static, slide-deck-style investor pitch site for PadelGuest. Built with Astro 6 + Tailwind v4 + GSAP. Pixel-perfect to the Pencil designs at any viewport size.

**Spec:** [`../specs/features/pitch-site/spec.md`](../specs/features/pitch-site/spec.md)
**Source designs:** [`../padel-guest.pen`](../padel-guest.pen) — Pitch deck section at canvas (5500, -100)
**Reference PDF:** [`../deck-export/PadelGuest-Pitch-Deck-Draft.pdf`](../deck-export/PadelGuest-Pitch-Deck-Draft.pdf)

---

## Quick start

```sh
cd ~/PadelGuest/pitch
npm install
npm run dev
# → http://localhost:4321
```

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm run dev`     | Start dev server at `localhost:4321`         |
| `npm run build`   | Build static site to `./dist/`               |
| `npm run preview` | Serve `./dist/` locally to verify production |

## Architecture

### Fixed-canvas responsive scaling

Every slide is a fixed `1920×1080` div, CSS-transform-scaled to fit the viewport.
This guarantees pixel-perfect parity with the Pencil designs at any zoom level.

- `src/scripts/slide-fitter.ts` — measures viewport, sets `--slide-scale`, `--slide-x`, `--slide-y` CSS variables
- `src/components/Slide.astro` — the wrapper component every page uses
- Letterboxing applies on aspect mismatch (cream or forest depending on slide bg)

### Routing

One Astro page per slide. Browser back/forward and deep links work natively.
View Transitions API (`<ClientRouter />`) handles slide-to-slide crossfades.

| Slide | URL                       |
| :---- | :------------------------ |
| 1     | `/`                       |
| 2     | `/02-hook`                |
| 3     | `/03-problem-insight`     |
| 4     | `/04-solution`            |
| 5     | `/05-operating-layer`     |
| 6     | `/06-why-now`             |
| 7     | `/07-market`              |
| 8     | `/08-model-economics`     |
| 9     | `/09-competition`         |
| 10    | `/10-beachhead`           |
| 11    | `/11-team`                |
| 12    | `/12-vision-close`        |

### Navigation

Handled by `src/scripts/deck-controller.ts` — vanilla TypeScript, no framework.

- `→` / `Space` / `PageDown` — next slide
- `←` / `PageUp` — previous slide
- `Home` / `End` — first / last slide
- Touch swipe (left = next, right = prev)

### File structure

```
pitch/
├── public/
│   ├── favicon.svg
│   └── slide-assets/        # Pencil PNG exports (renamed)
│       ├── registration.png
│       ├── available-matches.png
│       ├── whatsapp-flow.png
│       ├── stripe-checkout.png
│       ├── match-confirmed.png
│       └── dashboard.png
├── src/
│   ├── components/
│   │   └── Slide.astro      # 1920×1080 wrapper
│   ├── layouts/
│   │   └── DeckLayout.astro # HTML shell, fonts, scripts
│   ├── lib/
│   │   └── slides.ts        # Slide manifest
│   ├── pages/
│   │   └── index.astro      # Slide 1 (Cover)
│   │   └── ...              # Slides 2-12 to be added
│   ├── scripts/
│   │   ├── slide-fitter.ts  # CSS-transform scaling
│   │   └── deck-controller.ts # Keyboard, swipe, nav
│   └── styles/
│       ├── tokens.css       # Design system CSS variables
│       └── global.css       # Reset + font imports + Tailwind
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Tech stack

- **Astro 6.x** (static, no SSR)
- **Tailwind v4** via `@tailwindcss/vite`
- **GSAP 3.x** for slide animations (free MIT license)
- **TypeScript** (strict)
- **`@fontsource`** for self-hosted Instrument Serif, Inter, Geist Mono, Geist Sans
- **No React, no framework runtime** — slides ship as pure HTML/CSS, GSAP animates plain DOM

## Updating slide assets

When the Pencil designs change, re-export from `padel-guest.pen` and copy:

```sh
cd ~/PadelGuest/pitch
cp ../slide-assets/3uzkM.png public/slide-assets/registration.png
cp ../slide-assets/6OYJk.png public/slide-assets/available-matches.png
cp ../slide-assets/H5ILU.png public/slide-assets/whatsapp-flow.png
cp ../slide-assets/ayxIm.png public/slide-assets/stripe-checkout.png
cp ../slide-assets/83tnM.png public/slide-assets/match-confirmed.png
cp ../slide-assets/04Nqc.png public/slide-assets/dashboard.png
```

## Deployment (deferred)

Will deploy to GitHub Pages. When ready:
1. Set `site` and `base` in `astro.config.mjs` (e.g., `base: '/pitch/'` for project pages)
2. Add a GitHub Actions workflow to build + push to `gh-pages` branch
3. Enable Pages in repo settings

Not in scope for v1 build.
