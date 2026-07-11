# Testing Strategy — My Pokedex by Jublia AI

How unit, component, and end-to-end tests are organized, what CI enforces, and how to run everything locally.

---

## Test pyramid

| Layer | Tool | Location | What it covers |
|---|---|---|---|
| **Unit** | Jasmine + Karma | `src/app/**/*.spec.ts` (services, guards, interceptors, models, strategies) | Pure logic, HTTP mocking, error paths |
| **Component** | Jasmine + Karma + `TestBed` | `*.page.spec.ts`, `*.component.spec.ts` | Template bindings, user interactions, Ionic stubs |
| **E2E** | Playwright | `e2e/*.spec.ts` | Full user flows against a running dev server |

CI runs all three layers on every push and pull request to `main` / `master` (see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).

---

## Unit tests

**Focus:** services, guards, interceptors, handlers, models, and routing config.

Examples:

- `PokemonService` — filtering, pagination, cache reuse, batch fetching
- `PokemonTypeService` — type ID extraction and per-type cache
- `FavoritesService` — toggle, persist, clear
- `HapticsService` — preference read/write, no-op when disabled
- `PlatformService` — skips native calls on web
- `httpInterceptor` — timeout, retry on 5xx, `ApiError` mapping
- `pokemonIdGuard` — valid/invalid ID redirects

**Patterns:**

- Use `HttpTestingController` for service HTTP tests.
- Mock Capacitor plugins via Jasmine spies (see existing `*.spec.ts` files).
- Keep tests deterministic — no live PokéAPI calls in unit tests.

---

## Component tests

**Focus:** page and shared component behavior with shallow or full `TestBed` setup.

Examples:

- `PokemonListPage` — search, type chips, infinite scroll triggers
- `PokemonDetailPage` — stat display, favorite toggle
- `PokemonCardComponent` — favorite button aria labels, card output
- `ErrorRetryComponent`, `EmptyStateComponent` — error and empty UI states

**Patterns:**

- Import standalone components directly into `TestBed.configureTestingModule({ imports: [...] })`.
- Stub Ionic controllers (`ToastController`, etc.) where needed.
- Prefer querying by role/label over CSS selectors.

All feature pages and shared components use `ChangeDetectionStrategy.OnPush` — tests should trigger change detection via `fixture.detectChanges()` after signal or input updates.

---

## E2E tests

**Tool:** Playwright (`playwright.config.ts`)

**Location:** `e2e/smoke.spec.ts`

**Fixtures:** `e2e/fixtures/pokeapi-mocks.ts` — intercepts PokéAPI requests so e2e runs offline and deterministically.

### Covered flows

- Splash → home navigation
- Search filters the Pokémon list
- Card click opens detail view
- Add/remove favorite and verify Favorites tab
- Browse type filter applies on home (query param `?type=fire`)
- Compare two Pokémon from Settings
- Clear all favorites from Settings

### Accessibility in e2e

Smoke tests run **axe-core** scans (`@axe-core/playwright`) on home, detail, and compare screens with **no rules disabled**. Violations with `critical` or `serious` impact fail the build.

### Visual regression

`e2e/visual.spec.ts` captures Playwright screenshots for home (light/dark), detail (light/dark), and compare at 390×844. Baselines live in `e2e/screenshots/`.

```bash
npm run e2e:visual
# Regenerate baselines after intentional UI changes:
npx playwright test e2e/visual.spec.ts --update-snapshots
```

---

## Bundle size

Production builds use the Angular **application builder** (esbuild). Current initial bundle is ~**932 KB** raw (~204 KB transfer gzip). Budgets in `angular.json`: warn **1.1 MB**, error **1.3 MB**.

---

## Coverage gate

Configured in `karma.conf.js`:

| Metric | Minimum |
|---|---|
| Statements | **85%** |
| Branches | **80%** |

`angular.json` enables `codeCoverage: true` for the test target. `src/app/app.routes.ts` is excluded from coverage (route config only).

Coverage reports are written to `coverage/app/` (HTML + lcov).

---

## Running tests locally

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- Chrome (for Karma; CI uses ChromeHeadless)
- For e2e: Playwright browsers (installed automatically on first run, or via `npx playwright install chromium`)

### Unit + component (watch mode)

```bash
npm test
```

Opens Karma in Chrome with live reload.

### Unit + component (CI mode)

Matches the CI **Quality** job — headless, single run, coverage gate enforced:

```bash
npm run test:ci
```

Exit code is non-zero if coverage falls below thresholds or any spec fails.

### E2E (headless)

Starts the dev server on port `8100` automatically, then runs Playwright smoke tests:

```bash
npm run e2e
```

Visual regression only:

```bash
npm run e2e:visual
```

Reuses an already-running dev server when not in CI (`reuseExistingServer: !process.env.CI`).

### E2E (interactive UI)

```bash
npm run e2e:ui
```

Opens the Playwright UI for debugging steps, traces, and screenshots.

### Lint

```bash
npm run lint
```

Runs `@angular-eslint` on `src/**/*.ts` and `src/**/*.html`.

---

## CI pipeline summary

```text
quality (lint + test:ci)
    ├── e2e (Playwright smoke + visual, needs quality)
    └── build (production ng build, needs quality)
native (Android emulator + iOS simulator smoke) — parallel on push to main
security (npm audit --audit-level=high) — parallel
```

On e2e failure, the Playwright HTML report is uploaded as a CI artifact (`playwright-report/`, 7-day retention).

---

## Writing new tests

1. **New service method** — add or extend `*.service.spec.ts` with happy path and error path.
2. **New page or component** — add `*.spec.ts` alongside the source file; cover primary user action and empty/error states.
3. **New user journey** — add a Playwright test in `e2e/` and mock any new PokéAPI endpoints in `pokeapi-mocks.ts`.
4. **Before opening a PR** — run `npm run lint`, `npm run test:ci`, and `npm run e2e` locally.

See [`CONTRIBUTING.md`](../CONTRIBUTING.md) for the full PR checklist.
