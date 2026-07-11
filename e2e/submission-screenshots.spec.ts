import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { mockPokeApi } from './fixtures/pokeapi-mocks';

const OUT_DIR = path.join(process.cwd(), 'docs', 'screenshots');

async function preparePage(page: Page, viewport: { width: number; height: number }): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize(viewport);
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('CapacitorStorage.jublia_dex_theme', 'light');
  });
  await mockPokeApi(page);
}

async function waitForHome(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('app-pokemon-list ion-searchbar.app-searchbar')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText('Bulbasaur', { exact: true })).toBeVisible();
  await page.waitForLoadState('networkidle');
}

async function capture(page: Page, filePath: string): Promise<void> {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await page.screenshot({ path: filePath, fullPage: false });
}

test.describe('Submission screenshots', () => {
  test('capture mobile and desktop screens', async ({ page }) => {
    const mobile = { width: 390, height: 844 };
    const desktop = { width: 1280, height: 900 };

    // ── Mobile ──────────────────────────────────────────────
    await preparePage(page, mobile);
    await waitForHome(page);
    await capture(page, path.join(OUT_DIR, 'mobile', '01-home.png'));

    await page
      .locator('app-pokemon-card')
      .filter({ hasText: 'Squirtle' })
      .locator('.card-nav')
      .click();
    await page.waitForURL('**/pokemon/squirtle');
    await expect(page.locator('app-pokemon-detail').getByRole('heading', { name: 'Squirtle' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await capture(page, path.join(OUT_DIR, 'mobile', '02-detail.png'));

    await page.goto('/');
    await waitForHome(page);
    await page.locator('ion-tab-button[tab="compare"]').click();
    await page.waitForURL('**/compare');
    const compareSearch = page.locator('app-compare ion-searchbar input');
    await compareSearch.fill('char');
    await page.locator('app-compare .search-result').filter({ hasText: 'Charmander' }).getByRole('button', { name: 'Left' }).click();
    await compareSearch.fill('pika');
    await page.locator('app-compare .search-result').filter({ hasText: 'Pikachu' }).getByRole('button', { name: 'Right' }).click();
    await expect(page.locator('app-compare').getByRole('heading', { name: 'Stat Comparison' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await capture(page, path.join(OUT_DIR, 'mobile', '03-compare.png'));

    await page.locator('ion-tab-button[tab="home"]').click();
    await waitForHome(page);
    await page.locator('app-pokemon-card').filter({ hasText: 'Bulbasaur' }).locator('.favorite-btn').click();
    await page.locator('ion-tab-button[tab="favorites"]').click();
    await page.waitForURL('**/favorites');
    await expect(page.getByText('1 favorite')).toBeVisible();
    await capture(page, path.join(OUT_DIR, 'mobile', '04-favorites.png'));

    await page.locator('ion-tab-button[tab="settings"]').click();
    await page.waitForURL('**/settings');
    await expect(page.locator('app-settings')).toBeVisible();
    await capture(page, path.join(OUT_DIR, 'mobile', '05-settings.png'));

    // ── Desktop ─────────────────────────────────────────────
    await preparePage(page, desktop);
    await waitForHome(page);
    await capture(page, path.join(OUT_DIR, 'desktop', '01-home.png'));

    await page
      .locator('app-pokemon-card')
      .filter({ hasText: 'Squirtle' })
      .locator('.card-nav')
      .click();
    await page.waitForURL('**/pokemon/squirtle');
    await expect(page.locator('app-pokemon-detail').getByRole('heading', { name: 'Squirtle' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await capture(page, path.join(OUT_DIR, 'desktop', '02-detail.png'));

    await page.goto('/');
    await waitForHome(page);
    await page.locator('ion-tab-button[tab="compare"]').click();
    await page.waitForURL('**/compare');
    const desktopSearch = page.locator('app-compare ion-searchbar input');
    await desktopSearch.fill('char');
    await page.locator('app-compare .search-result').filter({ hasText: 'Charmander' }).getByRole('button', { name: 'Left' }).click();
    await desktopSearch.fill('pika');
    await page.locator('app-compare .search-result').filter({ hasText: 'Pikachu' }).getByRole('button', { name: 'Right' }).click();
    await expect(page.locator('app-compare').getByRole('heading', { name: 'Stat Comparison' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await capture(page, path.join(OUT_DIR, 'desktop', '03-compare.png'));
  });
});
