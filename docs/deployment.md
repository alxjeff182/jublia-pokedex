# Deployment — My Pokedex by Jublia AI

How to deploy the web app (GitHub Pages) and ship native iOS/Android builds via Capacitor 8.

---

## Environment matrix

| Setting | Development | Production | CI / E2E |
|---|---|---|---|
| File | `src/environments/environment.ts` | `src/environments/environment.prod.ts` | Development env + mocks |
| `production` | `false` | `true` | `false` |
| `pokeApiUrl` | `https://pokeapi.co/api/v2` | `https://pokeapi.co/api/v2` | Mocked in Playwright |
| `appVersion` | `1.0.0` | `1.0.0` | — |
| Build config | `development` | `production` (default) | `production` for CI build |
| Output | `www/` | `www/` | `www/` artifact |
| Base href | `/` (local) | `/` or repo name (Pages) | `/` |

Production builds replace `environment.ts` via `angular.json` `fileReplacements`.

No secrets are required for PokéAPI (public REST). Capacitor Preferences and haptics use device-local storage only.

---

## Web — GitHub Pages

Automated by [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) on push to `main` (and `workflow_dispatch`).

### CI deploy flow

1. `npm ci`
2. `npm run build -- --base-href=/${{ github.event.repository.name }}/`
3. Upload `www/` as a Pages artifact
4. Deploy via `actions/deploy-pages`

### Live URL

```text
https://<github-user>.github.io/<repository-name>/
```

The `base-href` must match the repository name so Angular router and assets resolve correctly.

### Manual web deploy

```bash
npm ci
npm run build -- --base-href=/your-repo-name/
```

Upload the contents of `www/` to any static host (GitHub Pages, Netlify, S3, etc.). Set the same `base-href` as the hosting path.

### Verify locally before deploy

```bash
npm run build
npx serve www
```

---

## Native — Capacitor iOS & Android

### Prerequisites

| Platform | Requirements |
|---|---|
| **Shared** | Node 20+, `npm run build` output in `www/` |
| **iOS** | macOS, Xcode, Apple Developer account (for device/TestFlight) |
| **Android** | Android Studio, JDK 17+, signing keystore (for Play Store) |

App ID: `com.jublia.dex` (`capacitor.config.ts`)

### Sync workflow

Every web build must be synced before native compile:

```bash
npm run cap:sync
# equivalent to: npm run ionic:build && npx cap sync
```

Or use convenience scripts:

```bash
npm run cap:ios      # sync + open Xcode
npm run cap:android  # sync + open Android Studio
```

### iOS release checklist

1. Bump `appVersion` in environment files and iOS `MARKETING_VERSION` in Xcode if needed.
2. `npm run cap:ios`
3. In Xcode: select **Any iOS Device**, set signing team, archive (**Product → Archive**).
4. Distribute via TestFlight or App Store Connect.
5. Verify: splash hide, status bar color, back button, haptics toggle, favorites persistence.

### Android release checklist

1. `npm run cap:android`
2. In Android Studio: **Build → Generate Signed Bundle / APK** (prefer AAB for Play Store).
3. Configure signing in `android/` (keystore not committed to repo).
4. Upload to Google Play Console (internal → production).
5. Verify same functional checklist as iOS.

### Native plugin notes

Plugins configured at runtime via `PlatformService` and `appInitializer`:

- Status bar, keyboard, splash screen — native only
- Preferences — works on web (localStorage-backed) and native
- Haptics — native only; no-op on web

---

## CI build artifact

The **Build** job in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) uploads `www/` as a 7-day artifact. Download it to smoke-test a production bundle without deploying.

---

## Performance targets

Enforced or tracked at release time:

| Target | Threshold | Enforcement |
|---|---|---|
| Initial JS bundle | **< 1.1 MB** warn / **1.3 MB** error | `angular.json` application builder budget |
| Total `www/` output | **< 2 MB** | Manual / release checklist |
| Component styles | < 8 KB each | `angular.json` `anyComponentStyle` budget |

Analyze bundle composition locally:

```bash
npm run analyze
```

Opens `analyze-report.html` (source-map-explorer).

---

## PWA (web only)

Production web builds register `@angular/service-worker` with `ngsw-config.json`:

- App shell and assets prefetched/lazy-cached
- PokéAPI responses cached (`performance` strategy, 7-day TTL)

The service worker is **disabled on Capacitor native** (`Capacitor.isNativePlatform()`). An offline banner appears in the web app when `navigator.onLine` is false.

---

## Native CI smoke tests

[`.github/workflows/native.yml`](../.github/workflows/native.yml) runs on push to `main`:

| Job | Runner | Steps |
|---|---|---|
| **Android** | `ubuntu-latest` | Build APK, boot API 34 emulator, install, launch, assert process |
| **iOS** | `macos-latest` | `xcodebuild` for iPhone 16 simulator, install, launch, assert |

Failures upload APK / `.app` artifacts for debugging.

### Troubleshooting native CI

- **Android emulator timeout** — re-run workflow; emulator boot is slow on shared runners.
- **iOS simulator name** — update `iPhone 16` in `native.yml` when Xcode images change.
- **Pod install fails** — ensure `ios/App/Podfile.lock` is committed after `pod install` locally.

---

| Channel | Action |
|---|---|
| GitHub Pages | Re-run deploy workflow from a previous `main` commit, or revert the merge commit |
| App Store / Play Store | Promote previous build in store console; native users keep local Preferences data |

---

## Related docs

- [Architecture](architecture.md) — Capacitor integration details
- [Testing strategy](testing-strategy.md) — pre-release test commands
- [CONTRIBUTING.md](../CONTRIBUTING.md) — CI requirements before merge
