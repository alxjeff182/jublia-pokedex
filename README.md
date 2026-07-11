# My Pokedex by Jublia AI

[![CI](https://github.com/alxjeff182/jublia-pokedex/actions/workflows/ci.yml/badge.svg)](https://github.com/alxjeff182/jublia-pokedex/actions/workflows/ci.yml)
[![Deploy](https://github.com/alxjeff182/jublia-pokedex/actions/workflows/deploy.yml/badge.svg)](https://github.com/alxjeff182/jublia-pokedex/actions/workflows/deploy.yml)

Premium Pokédex mobile/web application built for the Jublia Front End take-home assessment.

## Stack

- Angular 20 (standalone APIs)
- Ionic Angular 8
- Capacitor 8 (iOS + Android)
- REST PokéAPI (`https://pokeapi.co/api/v2`)

## Features

- Infinite scroll Pokémon browsing
- Pokémon detail view with image, stats, abilities, evolution chain, and moves
- Multi-select type filtering
- Search by name or ID
- Favorites persisted with Capacitor Preferences
- Compare two Pokémon side-by-side
- Splash screen and connection error retry state

## Design

UI follows the provided My Pokedex by Jublia AI mockup:

- Primary: `#E53935`
- Background: `#F5F5F7`
- Accent: `#00B8D9`
- Rounded cards, type chips, and bottom tab navigation

## Documentation

| Doc | Description |
|---|---|
| [`docs/development-guidelines.md`](docs/development-guidelines.md) | Ionic / Angular / Capacitor rules, styling, accessibility, OnPush |
| [`docs/architecture.md`](docs/architecture.md) | Layers, data flow, caching, routing, Capacitor |
| [`docs/testing-strategy.md`](docs/testing-strategy.md) | Unit, component, e2e tests; coverage gate |
| [`docs/accessibility-checklist.md`](docs/accessibility-checklist.md) | WCAG checklist and screen reader steps |
| [`docs/deployment.md`](docs/deployment.md) | GitHub Pages, iOS/Android release, env matrix |
| [`docs/ui-checklist.md`](docs/ui-checklist.md) | Mockup alignment checklist |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | PR checklist, lint/test/coverage requirements |

## Project Structure

```text
src/app/
  core/           # models, services, interceptors, guards, strategies
  shared/         # reusable UI components
  features/       # screens (splash, list, detail, favorites, compare, tabs)
```

## Performance targets

| Target | Threshold |
|---|---|
| Initial JS bundle (production) | < **1 MB** (enforced by `angular.json` budget) |
| Total `www/` output | < **2 MB** (release checklist) |

Analyze bundles locally: `npm run analyze`

## Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm 10+
- For native builds: Xcode (iOS) and/or Android Studio (Android)
- For e2e: Playwright browsers (`npx playwright install chromium`)

## Scripts

| Script | Description |
|---|---|
| `npm start` | Dev server on port 8100 |
| `npm run build` | Production build → `www/` |
| `npm test` | Karma unit/component tests (watch) |
| `npm run test:ci` | Headless tests + 85% coverage gate (CI) |
| `npm run e2e` | Playwright smoke tests (starts dev server) |
| `npm run e2e:ui` | Playwright interactive UI |
| `npm run lint` | ESLint (`src/**/*.ts`, `src/**/*.html`) |
| `npm run analyze` | Bundle size report (`analyze-report.html`) |
| `npm run cap:sync` | Build + `cap sync` |
| `npm run cap:ios` | Sync + open Xcode |
| `npm run cap:android` | Sync + open Android Studio |

## Run Locally (Web)

```bash
npm install
npm start
```

Open `http://localhost:8100`.

## Build

```bash
npm run build
```

## Native (Capacitor)

Sync web assets and open native IDE:

```bash
npm run cap:ios
npm run cap:android
```

Or manually:

```bash
npm run ionic:build
npx cap sync
npx cap open ios
npx cap open android
```

## API Notes

- List index: `GET /pokemon?limit=1300`
- Detail: `GET /pokemon/{id}`
- Species/flavor/evolution: `GET /pokemon-species/{id}`
- Type filter: `GET /type/{name}`

All access goes through `src/app/core/services/*`.

## Assessment Mapping

| Requirement | Implementation |
|---|---|
| Infinite scroll | `pokemon-list` + `IonInfiniteScroll` |
| Detail view | `pokemon-detail` |
| Image view | Official artwork sprites on cards and detail |
| Favorites | `FavoritesService` + Favorites tab |
| Type filter | Multi-select chips with intersected type IDs |

## Author

Jeffry — Jublia Front End Assessment
