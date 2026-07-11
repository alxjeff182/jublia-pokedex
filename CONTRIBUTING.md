# Contributing to My Pokedex by Jublia AI

Thank you for contributing. This project uses Angular 20, Ionic 8, and Capacitor 8 with standalone components. Please read the guidelines below before opening a pull request.

---

## Getting started

```bash
git clone https://github.com/alxjeff182/jublia-pokedex.git
cd jublia-pokedex
npm install
npm start
```

Open `http://localhost:8100`.

**Required reading:**

- [`docs/development-guidelines.md`](docs/development-guidelines.md) — Ionic-first styling, signals, service boundaries
- [`docs/architecture.md`](docs/architecture.md) — layers, data flow, routing
- [`docs/testing-strategy.md`](docs/testing-strategy.md) — how tests are organized

---

## Branch and commit conventions

- Branch from `main`: `feature/short-description`, `fix/issue-description`, `docs/topic`
- Keep commits focused; one logical change per commit when possible
- Use clear commit messages (imperative mood): `Add type filter query param sync`, `Fix favorite aria labels`

---

## Pull request checklist

Complete every item before requesting review:

### Code quality

- [ ] Changes follow standalone-component patterns (no new NgModules)
- [ ] PokéAPI access goes through `src/app/core/services/*` only — no direct `HttpClient` in features
- [ ] New pages/components use `ChangeDetectionStrategy.OnPush`
- [ ] Component-local state uses Angular signals where reactive
- [ ] Ionic components and documented CSS custom properties used for UI (see development guidelines)
- [ ] Page-specific styles in `*.page.scss`; no unnecessary global `ion-*` overrides

### UI and accessibility

- [ ] Verified on 375px mobile viewport
- [ ] Keyboard navigation works for new interactive elements
- [ ] Icon-only buttons have `aria-label`
- [ ] Checked relevant items in [`docs/accessibility-checklist.md`](docs/accessibility-checklist.md)
- [ ] Updated [`docs/ui-checklist.md`](docs/ui-checklist.md) if a design item was completed

### Tests

- [ ] `npm run lint` passes
- [ ] `npm run test:ci` passes (includes **85%** statement / **80%** branch coverage gate)
- [ ] New services, guards, and non-trivial logic have unit tests
- [ ] New pages/components have spec files covering primary behavior
- [ ] New user flows have Playwright coverage or an documented reason they do not
- [ ] `npm run e2e` passes locally

### Build and docs

- [ ] `npm run build` succeeds without budget errors (initial bundle < 1 MB)
- [ ] Environment changes documented in [`docs/deployment.md`](docs/deployment.md) if applicable
- [ ] New scripts or workflows reflected in `README.md`

---

## CI requirements

Every PR to `main` / `master` triggers [`.github/workflows/ci.yml`](.github/workflows/ci.yml):

| Job | Command | Must pass |
|---|---|---|
| Lint | `npm run lint` | Yes |
| Unit + component tests | `npm run test:ci` | Yes (coverage enforced) |
| E2E | `npm run e2e` | Yes |
| Production build | `npm run build` | Yes |
| Security audit | `npm audit --audit-level=high` | Yes |

PRs cannot merge with failing checks.

---

## Coverage expectations

Configured in `karma.conf.js`:

- **Statements:** 85% minimum
- **Branches:** 80% minimum

Add tests alongside the code you change. Do not lower thresholds without team agreement.

---

## Project structure for new work

| Add… | Location |
|---|---|
| Screen | `src/app/features/<name>/` |
| Reusable UI | `src/app/shared/components/<name>/` |
| API / app logic | `src/app/core/services/` |
| Models | `src/app/core/models/` |
| Route guard | `src/app/core/guards/` |
| E2E flow | `e2e/` + mocks in `e2e/fixtures/` |

---

## Questions

Open an issue or ask in the PR description. For Ionic, Angular, or Capacitor API questions, consult the official docs linked in [`docs/development-guidelines.md`](docs/development-guidelines.md).
