# My Pokedex by Jublia AI — UI Alignment Checklist

Source of truth: mockup `My Pokedex by Jublia AI — Premium Pokédex UI (PokeAPI Ready)`.

Use this checklist to track how closely the implementation matches the provided design. Check off items as they're implemented and verified against the mockup.

---

## 0. Design Tokens

- [x] `--ion-color-primary` = Pokédex Red `#E53935`
- [x] Background = Light Soft `#F5F5F7`
- [x] Secondary accent = Accent Cyan `#00B8D9`
- [x] Type color palette matches mockup swatches (Fire, Water, Grass, Psychic, etc.)
- [x] Typography: bold headings, medium/regular body, consistent scale
- [x] Card radius (~20px), soft drop shadow consistent across all cards
- [x] Type chip = pill shape, colored background, white text

---

## 1. Splash Screen

- [x] Centered Pokéball icon with soft red glow
- [x] "My Pokedex by Jublia AI" wordmark, bold, centered below icon
- [x] Small loading spinner near bottom (not full-screen blocking)
- [x] White / soft gradient background
- [x] Auto-navigates to Home after load

---

## 2. Home / Pokédex List

### Header
- [x] "My Pokedex by Jublia AI" title in toolbar
- [x] Pokéball icon/logo in header (top right or left)
- [x] Rounded/pill search bar with placeholder "Search"

### Filters
- [x] "Multi-Select Type" label above chips
- [x] Horizontal scrollable chip row (Fire, Water, Grass, Other, ...)
- [x] Selected chip state visually distinct (filled vs outline)

### Card Grid
- [x] 2-column grid layout
- [x] Sprite displayed on a colored circular background (color by primary type)
- [x] Heart/favorite icon top-right of each card
- [x] Pokémon ID (`#006` format) above name
- [x] Pokémon name, bold
- [x] Type chip(s) below name
- [x] Infinite scroll loads more cards on reaching bottom
- [x] Loading spinner / skeleton while fetching

### Navigation
- [x] Bottom tab bar, white background
- [x] Confirm final tab count/icons (mockup shows 4: Home, Grid/Search, Favorites, Settings) — **4 tabs: Home, Browse, Favorites, Settings; Compare moved to Settings**
- [x] Active tab shows primary red color

---

## 3. Pokémon Detail

### Hero
- [x] Large centered sprite image
- [x] Colored glow/background behind sprite, matched to primary type color — **soft radial glow on light bg (not solid type block)**
- [x] Back button top-left — **circular gray button, no toolbar title**
- [x] Share button top-right — **circular gray button**

### Info
- [x] ID + Name displayed prominently — **left-aligned below sprite**
- [x] Type chip(s) row
- [x] Favorite toggle as a labeled button (not just icon), e.g. "♥ Favorite" — **gray pill + red heart, inline with height/weight**
- [x] Height and Weight displayed side by side — **right of favorite button**

### Stats
- [x] Horizontal progress bar per stat (HP, Attack, Defense, Sp. Atk, Sp. Def, Speed) — **compact bars, value on left**
- [x] Numeric value shown next to/above each bar
- [x] Radar/spider chart visualizing all stats together — **side-by-side with bars in two-column layout**
- [x] Abilities section, expandable/collapsible (chevron indicator) — **menu row at top of white card**

### Evolution & Moves
- [x] Evolution chain shown as horizontal row of sprites — **circular icons with type glow**
- [x] Arrow/connector between evolution stages — **small chevron connectors**
- [x] Tapping an evolution sprite navigates to that Pokémon's detail
- [x] Moves list section at the bottom — **bottom sheet modal with search, filters, expandable move details**

---

## 4. Favorites

- [x] Same card grid layout/style as Home
- [x] Shows only favorited Pokémon
- [x] Favorites tab icon/heart shows active/red state when on this screen

---

## 5. Empty Favorites State

- [x] Centered Pokéball icon (or app icon) — **current: heart icon**
- [x] Friendly placeholder message ("An elegant mobile UI with a cute icon or message" style copy)
- [x] No stray buttons/actions — minimal, centered composition

---

## 6. Compare Pokémon

- [x] Two-column side-by-side layout
- [x] Sprite + ID + Name + Type chip per side
- [x] "vs" indicator between the two Pokémon
- [x] Height/Weight comparison row
- [x] Stat bars mirrored/aligned per stat (left bar vs right bar on same row)
- [x] Winning stat highlighted (color or bold) per row

---

## 7. Error / Retry State

- [x] Rendered as compact modal/overlay (not full-page takeover) — **ion-modal card overlay with backdrop dismiss**
- [x] Warning icon + short message ("Modern connection error. Please connect...")
- [x] Single "Retry" button
- [x] Dismissible or auto-retries on tap

---

## 8. Cross-Screen / System

- [x] Bottom tab bar consistent across Home, Favorites, Compare (and Settings if added)
- [x] Consistent header style (toolbar height, title alignment) across screens — **`app-screen-header` shared component; back button icon-only, title centered when back present**
- [x] Consistent spacing/padding rhythm (16px page padding baseline)
- [x] Dark mode not required by mockup — confirm light-only is acceptable
- [x] Responsive check: layout holds up on larger (tablet/desktop) viewports

---

## 9. Open Questions (resolve before final polish pass)

- [x] What does the mockup's 2nd tab icon (grid/search) represent — separate screen or same as Home? — **Browse Types screen; tap type → Home with filter**
- [x] Is a Settings tab/screen required, and what would it contain? — **Yes: app hero, Compare link, Clear favorites**
- [x] Is the radar chart a hard requirement, or can progress bars alone suffice? — **Implemented in detail (bars + radar side-by-side)**
- [x] Should Compare remain a dedicated tab, or be reachable from Detail instead? — **Route `/compare` from Settings, not a tab**

---

## Suggested Implementation Order

1. **Tier 1 (visual impact):** card grid anatomy, detail hero glow, type chip styling, tab bar active state
2. **Tier 2 (feature visuals):** radar chart, mirrored compare bars, error modal/overlay, empty state polish
3. **Tier 3 (nice-to-have):** Settings screen, share button, expandable abilities, splash glow animation
