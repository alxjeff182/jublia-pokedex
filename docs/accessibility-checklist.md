# Accessibility Checklist — JUBLIA Dex

WCAG 2.1 AA-oriented checklist for JUBLIA Dex, plus manual screen-reader verification steps. Use this before merging UI changes and when completing items in [`docs/ui-checklist.md`](ui-checklist.md).

Automated scans run in Playwright via `@axe-core/playwright` (see [`docs/testing-strategy.md`](testing-strategy.md)).

---

## WCAG checklist

### Perceivable

- [ ] **1.1.1 Non-text content** — Pokémon sprites have meaningful `alt` text (name). Decorative icons use `aria-hidden="true"` or empty alt.
- [ ] **1.3.1 Info and relationships** — Headings reflect page structure (`h1` for screen title, logical order). Lists use `ion-list` / semantic grouping.
- [ ] **1.3.2 Meaningful sequence** — DOM order matches visual reading order on mobile (375px) and desktop.
- [ ] **1.4.1 Use of color** — Type, stat, and favorite states are not conveyed by color alone (icons, labels, or text accompany color).
- [ ] **1.4.3 Contrast (Minimum)** — Text and interactive elements meet 4.5:1 (normal) / 3:1 (large). Type chips and primary red on soft background verified.
- [ ] **1.4.4 Resize text** — Layout remains usable at 200% browser zoom; no horizontal clipping of chip labels (`flex-shrink: 0` on `ion-chip`).
- [ ] **1.4.10 Reflow** — No two-dimensional scrolling required at 320px viewport width.
- [ ] **1.4.11 Non-text contrast** — Focus rings, button borders, and stat bar tracks meet 3:1 against adjacent colors.

### Operable

- [ ] **2.1.1 Keyboard** — All actions reachable via keyboard: search, chips, cards, tabs, favorite toggle, compare slots, settings actions.
- [ ] **2.1.2 No keyboard trap** — Focus can leave modals, search bars, and tab panels.
- [ ] **2.4.1 Bypass blocks** — Tab navigation provides direct access to main content areas.
- [ ] **2.4.2 Page titled** — `AppTitleStrategy` sets descriptive titles (`Home`, `Favorites`, Pokémon name on detail).
- [ ] **2.4.3 Focus order** — Focus moves logically through header → filters → content → tabs.
- [ ] **2.4.4 Link purpose** — Tab buttons and tappable cards have discernible names (Pokémon name, tab label).
- [ ] **2.4.7 Focus visible** — Interactive elements show visible focus (Ionic default or token-aligned outline).
- [ ] **2.5.1 Pointer gestures** — No path-based or multi-finger-only gestures required.

### Understandable

- [ ] **3.1.1 Language of page** — `lang="en"` on `<html>` in `src/index.html`.
- [ ] **3.2.1 On focus** — Focusing an element does not trigger unexpected navigation.
- [ ] **3.2.2 On input** — Search filters update predictably; no surprise redirects.
- [ ] **3.3.1 Error identification** — Invalid Pokémon ID shows toast ("Invalid Pokémon ID"). API errors show retry UI via `app-error-retry`.
- [ ] **3.3.2 Labels or instructions** — Search bars have placeholders; favorite buttons use `aria-label` ("Add to favorites" / "Remove from favorites").

### Robust

- [ ] **4.1.1 Parsing** — Valid HTML from Ionic components; no duplicate IDs.
- [ ] **4.1.2 Name, role, value** — Buttons expose name and role; toggles communicate state.
- [ ] **4.1.3 Status messages** — Toasts for errors; list count updates ("N Pokémon found") are perceivable.

---

## Component-specific checks

| Area | Check |
|---|---|
| **Search** | `ion-searchbar` has accessible name via placeholder or `aria-label` |
| **Type chips** | Selected state announced (visual + `aria-pressed` or distinct label where applicable) |
| **Pokémon cards** | Card is keyboard-activatable; favorite button is separate focusable control |
| **Tabs** | `ion-tab-button` labels match visible text (Home, Browse, Favorites, Settings) |
| **Detail** | Back navigation available; stat bars have text labels (HP, Attack, …) |
| **Compare** | Left/Right slot buttons have clear names; stat comparison readable in sequence |
| **Empty states** | `app-empty-state` provides heading + guidance text |
| **Error retry** | `app-error-retry` exposes a labeled Retry action |

---

## Manual screen reader steps

Test on **VoiceOver** (macOS/iOS) or **TalkBack** (Android). Run the web build at `http://localhost:8100` or a native Capacitor build.

### 1. Splash → Home

1. Launch the app. Confirm splash announces or lands on home within a few seconds.
2. Verify the first heading heard is **"JUBLIA Dex"**.
3. Swipe to the search field — confirm placeholder or label is read ("Search Pokémon by name or ID").

### 2. Search and list

1. Enter "char" in search. Confirm results update and a count or result context is announced.
2. Navigate to a card. Confirm **Pokémon name**, **ID** (`#004`), and **types** are readable.
3. Activate favorite button — confirm state change ("Add to favorites" → "Remove from favorites").

### 3. Detail view

1. Open a Pokémon from the list.
2. Confirm heading reads the Pokémon name.
3. Swipe through stats — each stat name and value should be announced in order.
4. Activate back — confirm return to list without losing context.

### 4. Tabs

1. Move to tab bar. Each tab (Home, Browse, Favorites, Settings) should announce its name and selected state.
2. Open **Favorites** with no favorites — empty state heading ("No favorites yet") should be read.
3. Open **Browse**, select a type — confirm navigation to filtered home is clear.

### 5. Compare

1. Settings → Compare Pokémon.
2. Search and assign Left/Right slots — button names ("Left", "Right") must be unambiguous.
3. Confirm stat comparison section heading ("Stat Comparison") and row labels are announced.

### 6. Errors

1. Simulate offline or blocked API (dev tools). Confirm error message and **Retry** are focusable and labeled.

---

## Automated axe in CI

E2e smoke tests run axe on home and detail routes. Current known exception:

- `color-contrast` — disabled in e2e until type-chip and accent colors are tuned to pass AA everywhere.

Re-enable the rule in `e2e/smoke.spec.ts` once contrast fixes land.

---

## Before merging UI changes

- [ ] Ran manual screen reader pass on changed screens
- [ ] Verified keyboard-only navigation on changed flows
- [ ] Checked 375px viewport for truncation and touch target size (≥ 44×44 px)
- [ ] Confirmed favorite/compare buttons have `aria-label` where icon-only
- [ ] Ran `npm run e2e` (includes axe scan)

See also the accessibility section in [`docs/development-guidelines.md`](development-guidelines.md).
