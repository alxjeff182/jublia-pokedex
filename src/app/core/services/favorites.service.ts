import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const FAVORITES_KEY = 'jublia_dex_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly favoriteIds = signal<Set<number>>(new Set());
  readonly favorites = this.favoriteIds.asReadonly();

  async init(): Promise<void> {
    const { value } = await Preferences.get({ key: FAVORITES_KEY });
    if (!value) {
      return;
    }

    try {
      const ids = JSON.parse(value) as number[];
      this.favoriteIds.set(new Set(ids));
    } catch {
      this.favoriteIds.set(new Set());
    }
  }

  isFavorite(id: number): boolean {
    return this.favoriteIds().has(id);
  }

  async toggleFavorite(id: number): Promise<void> {
    const next = new Set(this.favoriteIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.favoriteIds.set(next);
    await this.persist(next);
  }

  getFavoriteIds(): number[] {
    return Array.from(this.favoriteIds()).sort((a, b) => a - b);
  }

  async clearAll(): Promise<void> {
    this.favoriteIds.set(new Set());
    await Preferences.remove({ key: FAVORITES_KEY });
  }

  private async persist(ids: Set<number>): Promise<void> {
    await Preferences.set({
      key: FAVORITES_KEY,
      value: JSON.stringify(Array.from(ids)),
    });
  }
}
