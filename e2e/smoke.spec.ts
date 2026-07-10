import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mockPokeApi } from './fixtures/pokeapi-mocks';

async function waitForHome(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForURL('**/tabs/home', { timeout: 15_000 });
  await expect(page.locator('app-pokemon-list ion-searchbar.home-searchbar')).toBeVisible();
  await expect(page.getByText('Bulbasaur', { exact: true })).toBeVisible();
}

async function runAxe(page: Page, scope?: string): Promise<void> {
  let builder = new AxeBuilder({ page });
  if (scope) {
    builder = builder.include(scope);
  }
  const accessibilityScanResults = await builder.analyze();
  const criticalOrSerious = accessibilityScanResults.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious',
  );
  expect(criticalOrSerious).toEqual([]);
}

test.describe('JUBLIA Dex smoke flows', () => {
  test.beforeEach(async ({ page }) => {
    await mockPokeApi(page);
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('splash navigates to home', async ({ page }) => {
    await waitForHome(page);
    await expect(page.getByText('Bulbasaur', { exact: true })).toBeVisible();
    await runAxe(page, 'app-pokemon-list');
  });

  test('search filters the Pokémon list', async ({ page }) => {
    await waitForHome(page);

    const searchbar = page.locator('ion-searchbar.home-searchbar');
    await searchbar.locator('input').fill('char');
    await expect(page.getByText('Charmander', { exact: true })).toBeVisible();
    await expect(page.getByText('Bulbasaur', { exact: true })).not.toBeVisible();
    await expect(page.getByText(/Pokémon found/i)).toBeVisible();
  });

  test('opens Pokémon detail from a card', async ({ page }) => {
    await waitForHome(page);

    await page
      .locator('app-pokemon-card')
      .filter({ hasText: 'Squirtle' })
      .locator('.card-nav')
      .click();
    await page.waitForURL('**/tabs/pokemon/7');
    await expect(page.locator('app-pokemon-detail').getByRole('heading', { name: 'Squirtle' })).toBeVisible();
    await expect(page.locator('app-pokemon-detail').getByText('#007')).toBeVisible();
    await runAxe(page, 'app-pokemon-detail');
  });

  test('favorites a Pokémon and shows it on the favorites tab', async ({ page }) => {
    await waitForHome(page);

    const bulbasaurCard = page.locator('app-pokemon-card').filter({ hasText: 'Bulbasaur' });
    await bulbasaurCard.locator('.favorite-btn').click();
    await expect(bulbasaurCard.locator('.favorite-btn')).toHaveAttribute(
      'aria-label',
      'Remove from favorites',
    );

    await page.locator('ion-tab-button[tab="favorites"]').click();
    await page.waitForURL('**/tabs/favorites');
    await expect(page.getByText('1 favorite')).toBeVisible();
    await expect(
      page.locator('app-favorites app-pokemon-card').filter({ hasText: 'Bulbasaur' }),
    ).toBeVisible();
  });

  test('browse type filter applies on home', async ({ page }) => {
    await waitForHome(page);

    await page.locator('ion-tab-button[tab="browse"]').click();
    await page.waitForURL('**/tabs/browse');
    await expect(page.getByText('Browse Types')).toBeVisible();

    await page.getByRole('button', { name: /Fire/i }).click();
    await page.waitForURL('**/tabs/home?type=fire');
    await expect(page.getByText('Charmander', { exact: true })).toBeVisible();
    await expect(page.getByText('Bulbasaur', { exact: true })).not.toBeVisible();
    await expect(page.locator('ion-chip.type-filter-chip--active', { hasText: 'Fire' })).toBeVisible();
  });

  test('compare two Pokémon from settings', async ({ page }) => {
    await waitForHome(page);

    await page.locator('ion-tab-button[tab="settings"]').click();
    await page.waitForURL('**/tabs/settings');
    await page.getByRole('listitem').filter({ hasText: 'Compare Pokémon' }).click();
    await page.waitForURL('**/tabs/compare');

    const compareSearch = page.locator('app-compare ion-searchbar input');
    await compareSearch.fill('char');
    await expect(page.locator('app-compare').getByText('Charmander', { exact: true })).toBeVisible();

    const charmanderRow = page.locator('app-compare ion-item').filter({ hasText: 'Charmander' });
    await charmanderRow.getByRole('button', { name: 'Left' }).click();
    await expect(page.locator('app-compare .compare-card').first().getByText('Charmander', { exact: true })).toBeVisible();

    await compareSearch.fill('pika');
    await expect(page.locator('app-compare').getByText('Pikachu', { exact: true })).toBeVisible();
    const pikachuRow = page.locator('app-compare ion-item').filter({ hasText: 'Pikachu' });
    await pikachuRow.getByRole('button', { name: 'Right' }).click();
    await expect(page.locator('app-compare .compare-card').nth(1).getByText('Pikachu', { exact: true })).toBeVisible();

    await expect(page.locator('app-compare').getByRole('heading', { name: 'Stat Comparison' })).toBeVisible();
    await expect(page.getByText('Height')).toBeVisible();
    await expect(page.getByText('Weight')).toBeVisible();
    await runAxe(page, 'app-compare');
  });

  test('clears favorites from settings', async ({ page }) => {
    await waitForHome(page);

    const bulbasaurCard = page.locator('app-pokemon-card').filter({ hasText: 'Bulbasaur' });
    await bulbasaurCard.locator('.favorite-btn').click();

    await page.locator('ion-tab-button[tab="settings"]').click();
    await page.waitForURL('**/tabs/settings');
    await page.getByRole('button', { name: 'Clear all favorites' }).click();
    await page.locator('ion-alert').getByRole('button', { name: 'Clear all' }).click();

    await page.locator('ion-tab-button[tab="favorites"]').click();
    await page.waitForURL('**/tabs/favorites');
    await expect(page.getByRole('heading', { name: 'No favorites yet' })).toBeVisible();
  });
});
