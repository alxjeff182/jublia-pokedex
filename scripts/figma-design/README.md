# Figma Design — My Pokedex by Jublia AI

## Figma file

**URL:** https://www.figma.com/design/QqH1OAWzDrtleQ77xrxlxR/My-Pokedex-by-Jublia-AI

| Page | Status |
|------|--------|
| Design System | Built (colors, typography, type palette, shape tokens) |
| Components | Built (headers, search, cards, chips, tab bar, buttons) |
| Screens | **Run plugin below** — MCP Starter rate limit still active; use plugin to finish |

## Finish Screens page (one-time)

MCP built Design System + Components. To add all 7 screens × light/dark:

1. Open the file URL above in **Figma Desktop** (not browser).
2. **Plugins → Development → Import plugin from manifest…**  
   **NOT** Widgets → Import widget from manifest (that causes `containsWidget` error).
3. Select `scripts/figma-design/manifest.json` from this repo.
4. Run **Plugins → Development → My Pokedex Design Builder**.

**After updating the plugin:** remove the old dev plugin, then **Import plugin from manifest** again (manifest includes `networkAccess` for PokéAPI sprites). On the **Screens** page, delete any partial frames from a previous run, then run the plugin.

Splash + Home screens now mirror the app more closely (vector pokeball, aura, compare promo card, real Pokémon sprites).

If you see `Expected manifest.containsWidget to have type true` — you imported as a **widget**. Remove it from Widgets → Development, then import again via **Plugins → Development**.

## Alternative: full plugin from scratch

1. Open [figma.new](https://figma.new)
2. Rename to **My Pokedex by Jublia AI**
3. Import and run the plugin as above

## MCP setup (for future agent edits)

- `~/.cursor/mcp.json` includes Figma Web MCP (`https://mcp.figma.com/mcp`)
- Authenticate: Cursor **Settings → MCP → user-figma → Connect**
- Starter plan has limited MCP calls; Professional unlocks more

## Security

Rotate any personal access token shared in chat: Figma → Settings → Security → Personal access tokens. Never commit tokens to this repo.

## Design source of truth

- `src/theme/design-tokens.scss`
- `src/app/core/i18n/translations/en.ts`
- `src/app/features/*`
