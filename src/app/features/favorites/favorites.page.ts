import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline } from 'ionicons/icons';
import { PokemonCardData } from '../../core/models/pokemon.model';
import { FavoritesService } from '../../core/services/favorites.service';
import { HapticsService } from '../../core/services/haptics.service';
import { PokemonService } from '../../core/services/pokemon.service';
import { LanguageService } from '../../core/services/language.service';
import { ErrorRetryComponent } from '../../shared/components/error-retry/error-retry.component';
import { ComparePromoComponent } from '../../shared/components/compare-promo/compare-promo.component';
import { PokemonCardComponent } from '../../shared/components/pokemon-card/pokemon-card.component';
import { ScreenHeaderComponent } from '../../shared/components/screen-header/screen-header.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    ScreenHeaderComponent,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonIcon,
    PokemonCardComponent,
    ComparePromoComponent,
    ErrorRetryComponent,
    TranslatePipe,
  ],
  templateUrl: './favorites.page.html',
  styleUrl: './favorites.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPage implements ViewWillEnter {
  private readonly favorites = inject(FavoritesService);
  private readonly pokemonService = inject(PokemonService);
  private readonly router = inject(Router);
  private readonly haptics = inject(HapticsService);
  private readonly lang = inject(LanguageService);

  readonly pokemon = signal<PokemonCardData[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly removingIds = signal<Set<number>>(new Set());

  readonly favoriteCount = computed(() => this.pokemon().length);

  readonly favoriteCountLabel = computed(() => {
    this.lang.locale();
    const count = this.favoriteCount();
    return count === 1
      ? this.lang.t('favorites.countOne', { count })
      : this.lang.t('favorites.countMany', { count });
  });

  constructor() {
    addIcons({ heartOutline });
  }

  ionViewWillEnter(): void {
    this.loadFavorites();
  }

  retry(): void {
    this.loadFavorites();
  }

  dismissError(): void {
    this.error.set(false);
  }

  onRefresh(event: RefresherCustomEvent): void {
    this.loadFavorites(async () => {
      void event.target.complete();
      await this.haptics.lightImpact();
    });
  }

  onFavoriteToggled(id: number): void {
    if (this.favorites.isFavorite(id)) {
      return;
    }

    this.removingIds.update((ids) => new Set(ids).add(id));
    window.setTimeout(() => {
      this.pokemon.update((items) => items.filter((item) => item.id !== id));
      this.removingIds.update((ids) => {
        const next = new Set(ids);
        next.delete(id);
        return next;
      });
    }, 280);
  }

  goHome(): void {
    void this.router.navigate(['/']);
  }

  private loadFavorites(onComplete?: () => void): void {
    const ids = this.favorites.getFavoriteIds();
    if (ids.length === 0) {
      this.pokemon.set([]);
      this.loading.set(false);
      this.error.set(false);
      onComplete?.();
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    this.pokemonService.getCardsByIds(ids).subscribe({
      next: (cards) => {
        this.pokemon.set(cards);
        this.loading.set(false);
        onComplete?.();
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
        onComplete?.();
      },
    });
  }
}
