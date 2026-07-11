# Documentation

Technical documentation for **My Pokedex by Jublia AI** — a portfolio Pokédex app built with Angular, Ionic, and Capacitor.

**Live app:** https://alxjeff182.github.io/jublia-pokedex/

---

## Start here

| If you want to… | Read |
|---|---|
| Run the app locally | [README — Quick start](../README.md#quick-start) |
| Understand how the app is built | [architecture.md](architecture.md) |
| Contribute or open a PR | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Follow UI and code conventions | [development-guidelines.md](development-guidelines.md) |
| Deploy to web or native stores | [deployment.md](deployment.md) |

---

## Guides

### Architecture & data

- **[architecture.md](architecture.md)** — layer diagram, feature modules, PokéAPI service layer, in-memory caching, favorites persistence, routing and lazy loading.

### Development

- **[development-guidelines.md](development-guidelines.md)** — standalone components, Ionic component APIs, design tokens, signals for local state, accessibility patterns, OnPush change detection.

### Quality

- **[testing-strategy.md](testing-strategy.md)** — Karma unit/component specs, coverage thresholds (85% statements / 80% branches), Playwright smoke and visual tests.
- **[accessibility-checklist.md](accessibility-checklist.md)** — focus order, aria labels, contrast, screen-reader verification steps.

### Design & UI

- **[ui-checklist.md](ui-checklist.md)** — design token and screen alignment tracker.
- **[screenshots/README.md](screenshots/README.md)** — preview images and how to regenerate them.
- **[Figma file](https://www.figma.com/design/QqH1OAWzDrtleQ77xrxlxR/My-Pokedex-by-Jublia-AI)** — Design System, Components, Screens (light/dark).
- **[scripts/figma-design/README.md](../scripts/figma-design/README.md)** — local Figma plugin to rebuild design pages from code.

### Operations

- **[deployment.md](deployment.md)** — GitHub Pages workflow, Capacitor native builds, environment matrix.

---

## Key conventions

1. **PokéAPI access** goes through `src/app/core/services/*` — never call the API directly from pages.
2. **Standalone components only** — no new NgModules.
3. **Ionic-first UI** — use `ion-*` components and documented CSS custom properties before custom CSS.
4. **Signals** for component-local reactive state.
5. **Feature folders** under `src/app/features/`, shared UI under `src/app/shared/components/`.

---

## Screens at a glance

| Screen | Route | Feature folder |
|---|---|---|
| Splash | `/splash` | `features/splash` |
| Home (Pokédex list) | `/` | `features/pokemon-list` |
| Detail | `/pokemon/:id` | `features/pokemon-detail` |
| Compare | `/compare` | `features/compare` |
| Favorites | `/favorites` | `features/favorites` |
| Settings | `/settings` | `features/settings` |
| Browse by type | `/browse` | `features/browse` |
