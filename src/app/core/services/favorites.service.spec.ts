import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';

const STORAGE_KEY = 'CapacitorStorage.jublia_dex_favorites';

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads favorites from preferences on init', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 25]));
    await service.init();
    expect(service.getFavoriteIds()).toEqual([1, 25]);
    expect(service.isFavorite(25)).toBeTrue();
  });

  it('toggles favorite and persists', async () => {
    await service.toggleFavorite(7);
    expect(service.isFavorite(7)).toBeTrue();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([7]));

    await service.toggleFavorite(7);
    expect(service.isFavorite(7)).toBeFalse();
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([]));
  });

  it('returns sorted favorite ids', async () => {
    await service.toggleFavorite(25);
    await service.toggleFavorite(1);
    expect(service.getFavoriteIds()).toEqual([1, 25]);
  });

  it('clears all favorites', async () => {
    await service.toggleFavorite(1);
    await service.clearAll();
    expect(service.getFavoriteIds()).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('handles clear when storage is already empty', async () => {
    await service.clearAll();
    expect(service.getFavoriteIds()).toEqual([]);
  });
});
