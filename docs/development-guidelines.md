# Development Guidelines — My Pokedex by Jublia AI

Official documentation is the source of truth for components, APIs, and styling. Read the relevant docs **before** changing UI, styles, or platform behavior.

## Official documentation

| Stack | URL | Use when |
|---|---|---|
| **Ionic** | https://ionicframework.com/docs | Choosing/styling `ion-*` components, theming, layout |
| **Angular** | https://angular.dev | Standalone components, signals, routing, DI, templates |
| **Capacitor** | https://capacitorjs.com/docs | Native plugins, `cap sync`, iOS/Android config |

### Ionic quick links

- Components: https://ionicframework.com/docs/components
- Theming / CSS variables: https://ionicframework.com/docs/theming/css-variables
- `ion-chip`: https://ionicframework.com/docs/api/chip
- `ion-searchbar`: https://ionicframework.com/docs/api/searchbar
- `ion-tabs`: https://ionicframework.com/docs/api/tabs
- Standalone Angular: https://ionicframework.com/docs/angular/standalone

### Angular quick links

- Standalone components: https://angular.dev/guide/components
- Signals: https://angular.dev/guide/signals
- Routing: https://angular.dev/guide/routing

### Capacitor quick links

- Preferences (favorites): https://capacitorjs.com/docs/apis/preferences
- Workflow: https://capacitorjs.com/docs/basics/workflow

---

## Styling rules (Ionic-first)

1. **Use Ionic components** (`ion-button`, `ion-chip`, `ion-card`, …) instead of custom HTML for UI primitives.
2. **Prefer component APIs** (`color`, `outline`, `fill`, `size`) before writing custom CSS.
3. **Theme via CSS custom properties** documented on each component (e.g. `ion-chip` → `--background`, `--color`).  
   Do **not** fight the component with arbitrary `border`, `width`, or host overrides unless the docs support it.
4. **Do not put `ion-label` inside `ion-chip`** — chips have no label slot; use plain text or `ion-icon` per [ion-chip docs](https://ionicframework.com/docs/api/chip).
5. **Project tokens** live in `src/theme/design-tokens.scss` and `src/app/core/constants/design-tokens.ts`. Map brand colors through `src/theme/variables.scss` to Ionic (`--ion-color-primary`, etc.).
6. **Page-specific layout** belongs in the feature `*.page.scss`, not global overrides of `ion-*` unless shared across the app.
7. **No custom web fonts** unless explicitly requested — use Ionic/system defaults.
8. **Horizontal chip/filter rows** must set `flex-shrink: 0` on each `ion-chip` so text is not truncated in scroll containers.

---

## Component change checklist

Before merging UI changes:

- [ ] Verified against the matching page on ionicframework.com/docs/api/*
- [ ] Used Ionic `color` / `outline` / slots where applicable
- [ ] Styling uses documented CSS custom properties only
- [ ] No new global `ion-*` overrides without a comment explaining why
- [ ] Checked on mobile-width viewport (375px)
- [ ] Updated `docs/ui-checklist.md` if a design item was completed

---

## Change detection (OnPush)

All pages and shared components **must** use `ChangeDetectionStrategy.OnPush`.

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

**Rules:**

1. Prefer **Angular signals** (`signal`, `computed`, `input`) for component state — signals mark OnPush views dirty automatically.
2. When mutating non-signal state in OnPush components, call `ChangeDetectorRef.markForCheck()` explicitly.
3. Do not remove OnPush to "fix" update issues — fix the data flow instead.
4. New feature pages and `shared/components/*` must include OnPush from the first commit.

---

## Accessibility

Follow [`docs/accessibility-checklist.md`](accessibility-checklist.md) for the full WCAG checklist and manual screen reader steps.

**Minimum bar for every UI change:**

1. **Keyboard** — all actions reachable without a pointer; visible focus on interactive elements.
2. **Labels** — icon-only controls (`ion-button`, favorite toggle) need `aria-label`; search fields need placeholder or `aria-label`.
3. **Semantics** — use heading levels logically; prefer `getByRole` selectors in tests.
4. **Color** — do not rely on color alone for type, favorite, or error state.
5. **Touch targets** — aim for 44×44 px minimum on mobile; avoid truncating chip text (`flex-shrink: 0` on `ion-chip`).
6. **Automated scan** — e2e smoke tests run axe-core; fix violations before merging when feasible.

Ionic components provide baseline roles and keyboard behavior — use documented APIs (`aria-label`, `disabled`, slots) before custom ARIA hacks.

---

## Project conventions

- **Standalone components only** — no new NgModules.
- **PokéAPI** — all HTTP through `src/app/core/services/*`; use the HTTP interceptor, never bypass it.
- **Feature screens** — `src/app/features/*` (one folder per screen).
- **Shared UI** — `src/app/shared/components/*`.
- **Signals** — component-local reactive state; services expose `readonly` signals where shared.

See also [`.cursor/rules/ionic-angular.mdc`](../.cursor/rules/ionic-angular.mdc) and [`.cursor/rules/official-docs.mdc`](../.cursor/rules/official-docs.mdc).

**Related docs:** [`architecture.md`](architecture.md) · [`testing-strategy.md`](testing-strategy.md) · [`deployment.md`](deployment.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md)
