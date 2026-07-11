import { expect, test, type Page } from '@playwright/test';
import { mockPokeApi } from './fixtures/pokeapi-mocks';

async function preparePage(page: Page, theme: 'light' | 'dark' = 'light'): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((selectedTheme) => {
    window.localStorage.clear();
    window.localStorage.setItem('CapacitorStorage.jublia_dex_theme', selectedTheme);
  }, theme);
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

async function applyThemeClass(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.evaluate((selectedTheme) => {
    const root = document.documentElement;
    root.classList.remove('ion-palette-light', 'ion-palette-dark');
    root.classList.add(selectedTheme === 'dark' ? 'ion-palette-dark' : 'ion-palette-light');
    root.style.colorScheme = selectedTheme;
  }, theme);
}

test.describe('Visual regression', () => {
  test('home screen', async ({ page }) => {
    await preparePage(page, 'light');
    await waitForHome(page);
    await expect(page.locator('app-pokemon-list')).toHaveScreenshot('home-light.png');
  });

  test('home screen dark', async ({ page }) => {
    await preparePage(page, 'dark');
    await waitForHome(page);
    await applyThemeClass(page, 'dark');
    await expect(page.locator('app-pokemon-list')).toHaveScreenshot('home-dark.png');
  });

  test('pokemon detail screen', async ({ page }) => {
    await preparePage(page, 'light');
    await waitForHome(page);
    await page
      .locator('app-pokemon-card')
      .filter({ hasText: 'Squirtle' })
      .locator('.card-nav')
      .click();
    await page.waitForURL('**/pokemon/squirtle');
    await expect(page.locator('app-pokemon-detail').getByRole('heading', { name: 'Squirtle' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('app-pokemon-detail')).toHaveScreenshot('detail-light.png');
  });

  test('pokemon detail screen dark', async ({ page }) => {
    await preparePage(page, 'dark');
    await waitForHome(page);
    await applyThemeClass(page, 'dark');
    await page
      .locator('app-pokemon-card')
      .filter({ hasText: 'Squirtle' })
      .locator('.card-nav')
      .click();
    await page.waitForURL('**/pokemon/squirtle');
    await expect(page.locator('app-pokemon-detail').getByRole('heading', { name: 'Squirtle' })).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('app-pokemon-detail')).toHaveScreenshot('detail-dark.png');
  });

  test('compare screen', async ({ page }) => {
    await preparePage(page, 'light');
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
    await expect(page.locator('app-compare')).toHaveScreenshot('compare-light.png');
  });
});
