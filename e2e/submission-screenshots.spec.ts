import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'docs', 'screenshots');

async function preparePage(page: Page, viewport: { width: number; height: number }): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('CapacitorStorage.jublia_dex_theme', 'light');
  });
}

async function waitForImages(page: Page, selector: string, minCount = 1): Promise<void> {
  await page.waitForFunction(
    ({ sel, min }) => {
      const imgs = Array.from(document.querySelectorAll(sel)) as HTMLImageElement[];
      if (imgs.length < min) return false;
      return imgs.every((img) => img.complete && img.naturalWidth > 0);
    },
    { sel: selector, min: minCount },
    { timeout: 30_000 },
  );
}

async function waitForHome(page: Page): Promise<void> {
  await page.goto('/splash');
  await page.waitForURL((url) => url.pathname === '/' || url.pathname === '', { timeout: 20_000 });
  await expect(page.locator('app-splash')).toHaveCount(0, { timeout: 5_000 });
  await expect(page.locator('app-pokemon-list ion-searchbar.app-searchbar')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator('.skeleton-grid')).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByText('Bulbasaur', { exact: true })).toBeVisible();
  await waitForImages(page, 'app-pokemon-card img.pokemon-sprite', 4);
  await waitForImages(page, 'app-compare-promo img.fighter-card__sprite', 2);
  await page.waitForTimeout(400);
}

async function captureViewport(page: Page, filePath: string): Promise<void> {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await page.waitForTimeout(200);
  await page.screenshot({ path: filePath, fullPage: false, animations: 'disabled' });
}


async function assignComparePokemon(
  page: Page,
  query: string,
  name: string,
  side: 'Left' | 'Right',
): Promise<void> {
  const search = page.locator('app-compare ion-searchbar input');
  await search.fill(query);
  const row = page.locator('app-compare .search-result').filter({ hasText: name }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.getByRole('button', { name: side, exact: true }).click();
}

type IonContentElement = HTMLElement & {
  getScrollElement?: () => Promise<HTMLElement>;
  scrollToPoint?: (x: number, y: number, duration: number) => Promise<void>;
};

async function getIonScrollTop(page: Page, contentSelector: string): Promise<number> {
  return page.locator(contentSelector).evaluate(async (ion) => {
    const el = ion as IonContentElement;
    if (typeof el.getScrollElement === 'function') {
      const scrollEl = await el.getScrollElement();
      return scrollEl.scrollTop;
    }
    return el.scrollTop;
  });
}

async function setIonScrollTop(page: Page, contentSelector: string, top: number): Promise<void> {
  await page.locator(contentSelector).evaluate(async (ion, y) => {
    const el = ion as IonContentElement;
    if (typeof el.scrollToPoint === 'function') {
      await el.scrollToPoint(0, y, 0);
      return;
    }
    if (typeof el.getScrollElement === 'function') {
      const scrollEl = await el.getScrollElement();
      scrollEl.scrollTop = y;
      return;
    }
    el.scrollTop = y;
  }, top);
}

async function scrollIonContent(page: Page, selector: string, top: number): Promise<void> {
  await setIonScrollTop(page, selector, top);
  await page.waitForTimeout(350);
}

/** Scroll ion-content so `targetSelector` sits fully above the bottom tab bar. */
async function fitAboveTabBar(
  page: Page,
  contentSelector: string,
  targetSelector: string,
  margin = 16,
): Promise<void> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const adjustment = await page.evaluate(
      ({ targetSel, gap }) => {
        const target = document.querySelector(targetSel);
        const tabBar = document.querySelector('ion-tab-bar');
        const header = document.querySelector('ion-header');
        if (!target) return 0;

        const tabBarHeight = tabBar?.getBoundingClientRect().height ?? 56;
        const headerBottom = (header?.getBoundingClientRect().bottom ?? 0) + 8;
        const safeBottom = window.innerHeight - tabBarHeight - gap;
        const rect = target.getBoundingClientRect();

        if (rect.bottom > safeBottom) {
          return rect.bottom - safeBottom;
        }
        if (rect.top < headerBottom) {
          return rect.top - headerBottom;
        }
        return 0;
      },
      { targetSel: targetSelector, gap: margin },
    );

    if (Math.abs(adjustment) <= 1) break;

    const currentTop = await getIonScrollTop(page, contentSelector);
    await setIonScrollTop(page, contentSelector, currentTop + adjustment);
    await page.waitForTimeout(250);
  }
}

async function fitRegionInSafeZone(
  page: Page,
  contentSelector: string,
  targetSelector: string,
  margin = 12,
): Promise<void> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const adjustment = await page.evaluate(
      ({ targetSel, gap }) => {
        const target = document.querySelector(targetSel);
        const tabBar = document.querySelector('ion-tab-bar');
        const header = document.querySelector('ion-header');
        if (!target || !tabBar || !header) return 0;

        const safeTop = header.getBoundingClientRect().bottom + gap;
        const safeBottom = window.innerHeight - tabBar.getBoundingClientRect().height - gap;
        const rect = target.getBoundingClientRect();
        const safeHeight = safeBottom - safeTop;

        if (rect.height <= safeHeight) {
          const centeredTop = safeTop + (safeHeight - rect.height) / 2;
          const pinnedTop = Math.max(safeTop, Math.min(centeredTop, safeBottom - rect.height));
          return rect.top - pinnedTop;
        }
        if (rect.top > safeTop) return rect.top - safeTop;
        if (rect.bottom > safeBottom) return rect.bottom - safeBottom;
        return 0;
      },
      { targetSel: targetSelector, gap: margin },
    );

    if (Math.abs(adjustment) <= 1) break;

    const currentTop = await getIonScrollTop(page, contentSelector);
    await setIonScrollTop(page, contentSelector, currentTop + adjustment);
    await page.waitForTimeout(250);
  }
}

async function fitPokemonCardAboveTabBar(
  page: Page,
  contentSelector: string,
  cardIndex: number,
  margin = 20,
): Promise<void> {
  await page.evaluate((index) => {
    const cards = document.querySelectorAll('app-pokemon-list app-pokemon-card');
    const target = cards[index];
    if (!target) return;
    target.setAttribute('data-screenshot-anchor', 'true');
  }, cardIndex);
  await fitAboveTabBar(page, contentSelector, 'app-pokemon-card[data-screenshot-anchor="true"]', margin);
  await page.evaluate(() => {
    document.querySelector('app-pokemon-card[data-screenshot-anchor="true"]')?.removeAttribute('data-screenshot-anchor');
  });
}

async function prepareCompareScreenshot(page: Page, viewportWidth: number): Promise<void> {
  const contentSelector = 'app-compare ion-content';
  await page.locator('app-compare ion-searchbar input').fill('');
  await scrollIonContent(page, contentSelector, viewportWidth < 640 ? 150 : 0);
  if (viewportWidth < 640) {
    await fitRegionInSafeZone(page, contentSelector, '.compare-layout', 16);
  } else {
    await fitAboveTabBar(page, contentSelector, '.compare-layout', 24);
  }
}

test.describe('Submission screenshots', () => {
  test('capture mobile and desktop screens', async ({ page }) => {
    test.setTimeout(120_000);

    const mobile = { width: 390, height: 844 };
    const desktop = { width: 1280, height: 960 };

    // ── Mobile ──────────────────────────────────────────────
    await preparePage(page, mobile);
    await waitForHome(page);
    await scrollIonContent(page, 'app-pokemon-list ion-content', 300);
    await fitPokemonCardAboveTabBar(page, 'app-pokemon-list ion-content', 1);
    await captureViewport(page, path.join(OUT_DIR, 'mobile', '01-home.png'));

    await page
      .locator('app-pokemon-card')
      .filter({ hasText: 'Squirtle' })
      .locator('.card-nav')
      .click();
    await page.waitForURL('**/pokemon/squirtle');
    await expect(page.locator('app-pokemon-detail').getByRole('heading', { name: 'Squirtle' })).toBeVisible();
    await expect(page.locator('.loading-wrap')).toHaveCount(0, { timeout: 15_000 });
    await waitForImages(page, 'app-pokemon-detail .sprite-image', 1);
    await page.waitForTimeout(400);
    await captureViewport(page, path.join(OUT_DIR, 'mobile', '02-detail.png'));

    await page.goto('/compare');
    await expect(page.locator('app-compare ion-searchbar')).toBeVisible({ timeout: 15_000 });
    await assignComparePokemon(page, 'char', 'Charmander', 'Left');
    await assignComparePokemon(page, 'pika', 'Pikachu', 'Right');
    await expect(page.locator('app-compare').getByRole('heading', { name: 'Stat Comparison' })).toBeVisible();
    await waitForImages(page, 'app-compare .compare-card__body img', 2);
    await prepareCompareScreenshot(page, mobile.width);
    await page.waitForTimeout(500);
    await captureViewport(page, path.join(OUT_DIR, 'mobile', '03-compare.png'));

    await page.locator('ion-tab-button[tab="home"]').click();
    await waitForHome(page);
    const bulbasaurCard = page.locator('app-pokemon-card').filter({ hasText: 'Bulbasaur' });
    await bulbasaurCard.locator('.favorite-btn').click();
    await expect(bulbasaurCard.locator('.favorite-btn')).toHaveAttribute(
      'aria-label',
      'Remove from favorites',
    );
    await page.locator('ion-tab-button[tab="favorites"]').click();
    await page.waitForURL('**/favorites');
    await expect(
      page.locator('app-favorites app-pokemon-card').filter({ hasText: 'Bulbasaur' }),
    ).toBeVisible({ timeout: 15_000 });
    await waitForImages(page, 'app-favorites img.pokemon-sprite', 1);
    await page.waitForTimeout(400);
    await captureViewport(page, path.join(OUT_DIR, 'mobile', '04-favorites.png'));

    await page.locator('ion-tab-button[tab="settings"]').click();
    await expect(page.locator('app-settings')).toBeVisible({ timeout: 15_000 });
    await waitForImages(page, 'app-settings img', 1);
    await page.waitForTimeout(400);
    await captureViewport(page, path.join(OUT_DIR, 'mobile', '05-settings.png'));

    // ── Desktop ─────────────────────────────────────────────
    await preparePage(page, desktop);
    await waitForHome(page);
    await scrollIonContent(page, 'app-pokemon-list ion-content', 400);
    await fitPokemonCardAboveTabBar(page, 'app-pokemon-list ion-content', 7);
    await captureViewport(page, path.join(OUT_DIR, 'desktop', '01-home.png'));

    await page
      .locator('app-pokemon-card')
      .filter({ hasText: 'Squirtle' })
      .locator('.card-nav')
      .click();
    await page.waitForURL('**/pokemon/squirtle');
    await expect(page.locator('app-pokemon-detail').getByRole('heading', { name: 'Squirtle' })).toBeVisible();
    await expect(page.locator('.loading-wrap')).toHaveCount(0, { timeout: 15_000 });
    await waitForImages(page, 'app-pokemon-detail .sprite-image', 1);
    await page.waitForTimeout(400);
    await captureViewport(page, path.join(OUT_DIR, 'desktop', '02-detail.png'));

    await page.goto('/compare');
    await expect(page.locator('app-compare ion-searchbar')).toBeVisible({ timeout: 15_000 });
    await assignComparePokemon(page, 'char', 'Charmander', 'Left');
    await assignComparePokemon(page, 'pika', 'Pikachu', 'Right');
    await expect(page.locator('app-compare').getByRole('heading', { name: 'Stat Comparison' })).toBeVisible();
    await waitForImages(page, 'app-compare .compare-card__body img', 2);
    await prepareCompareScreenshot(page, desktop.width);
    await page.waitForTimeout(500);
    await captureViewport(page, path.join(OUT_DIR, 'desktop', '03-compare.png'));
  });
});
