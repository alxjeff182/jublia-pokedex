import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import {
  InfiniteScrollCustomEvent,
  IonButton,
  IonChip,
  IonContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSpinner,
  RefresherCustomEvent,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeCircle, closeCircleOutline, refreshOutline, searchOutline } from 'ionicons/icons';
import {
  BRAND_COLORS,
  getTypeColor,
  getTypeTintColor,
} from '../../core/constants/design-tokens';
import {
  POKEMON_TYPES,
  PokemonCardData,
} from '../../core/models/pokemon.model';
import { PokemonService } from '../../core/services/pokemon.service';
import { HapticsService } from '../../core/services/haptics.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslatePipe, TypeNamePipe } from '../../shared/pipes/translate.pipe';
import { ErrorRetryComponent } from '../../shared/components/error-retry/error-retry.component';
import { ComparePromoComponent } from '../../shared/components/compare-promo/compare-promo.component';
import { PokemonCardComponent } from '../../shared/components/pokemon-card/pokemon-card.component';
import { ScreenHeaderComponent } from '../../shared/components/screen-header/screen-header.component';

const PAGE_SIZE = 20;
const SUGGESTED_TYPES = ['fire', 'water', 'grass', 'electric', 'psychic', 'dragon'] as const;

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [
    ScreenHeaderComponent,
    IonContent,
    IonSearchbar,
  IonChip,
  IonButton,
  IonIcon,
  IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSpinner,
    PokemonCardComponent,
    ComparePromoComponent,
    ErrorRetryComponent,
    TranslatePipe,
    TypeNamePipe,
  ],
  templateUrl: './pokemon-list.page.html',
  styleUrl: './pokemon-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonListPage implements OnInit, ViewWillEnter {
  private readonly pokemonService = inject(PokemonService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly haptics = inject(HapticsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly lang = inject(LanguageService);
  private readonly searchReload$ = new Subject<void>();

  readonly pageSize = PAGE_SIZE;
  readonly availableTypes = POKEMON_TYPES;
  readonly selectedTypes = signal<string[]>([]);
  readonly searchQuery = signal('');
  readonly pokemon = signal<PokemonCardData[]>([]);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly error = signal(false);
  readonly hasMore = signal(true);
  readonly clearingFilters = signal(false);

  private offset = 0;
  private lastRouteType: string | null = null;

  readonly hasActiveFilters = computed(
    () => this.selectedTypes().length > 0 || this.searchQuery().trim().length > 0,
  );

  readonly activeFilterCount = computed(
    () => this.selectedTypes().length + (this.searchQuery().trim() ? 1 : 0),
  );

  readonly resultsLabel = computed(() => {
    this.lang.locale();
    const count = this.pokemon().length;
    if (count === 0) {
      return '';
    }

    const suffix = this.hasMore() ? '+' : '';
    const countLabel = `${count}${suffix}`;
    return this.hasActiveFilters()
      ? this.lang.t('home.resultsFound', { count: countLabel })
      : this.lang.t('home.resultsTotal', { count: countLabel });
  });

  readonly clearAllFiltersAria = computed(() => {
    this.lang.locale();
    return this.lang.t('home.clearAllFiltersAria', { count: this.activeFilterCount() });
  });

  readonly suggestedTypes = computed(() => {
    const selected = new Set(this.selectedTypes());
    return SUGGESTED_TYPES.filter((type) => !selected.has(type)).slice(0, 3);
  });

  ngOnInit(): void {
    addIcons({ closeCircle, closeCircleOutline, refreshOutline, searchOutline });
    this.searchReload$
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.resetAndLoad());
    this.applyTypeFromRoute();
    this.loadInitial();
  }

  ionViewWillEnter(): void {
    this.applyTypeFromRoute(true);
  }

  private applyTypeFromRoute(reloadIfChanged = false): void {
    const type = this.route.snapshot.queryParamMap.get('type');
    if (!type || !this.availableTypes.includes(type as (typeof POKEMON_TYPES)[number])) {
      return;
    }

    if (this.lastRouteType === type) {
      return;
    }

    this.lastRouteType = type;
    this.selectedTypes.set([type]);

    if (reloadIfChanged) {
      this.resetAndLoad();
    }
  }

  onSearchChange(event: CustomEvent): void {
    const value = (event.detail as { value?: string }).value ?? '';
    this.searchQuery.set(value);
    this.searchReload$.next();
  }

  onSearchClear(): void {
    this.searchQuery.set('');
    this.resetAndLoad();
  }

  toggleType(type: string): void {
    const current = this.selectedTypes();
    if (current.includes(type)) {
      this.selectedTypes.set(current.filter((item) => item !== type));
    } else {
      this.selectedTypes.set([...current, type]);
    }
    void this.haptics.selectionChanged();
    this.resetAndLoad();
  }

  isTypeSelected(type: string): boolean {
    return this.selectedTypes().includes(type);
  }

  typeLabel(type: string): string {
    return this.lang.translateType(type);
  }

  filterChipBackground(type: string): string {
    if (!this.isTypeSelected(type)) {
      return BRAND_COLORS.border;
    }
    return getTypeTintColor(type);
  }

  filterChipTextColor(type: string): string {
    if (!this.isTypeSelected(type)) {
      return BRAND_COLORS.textMuted;
    }
    return getTypeColor(type);
  }

  filterChipBorder(type: string): string {
    if (!this.isTypeSelected(type)) {
      return 'none';
    }
    return `1px solid ${getTypeColor(type)}`;
  }

  removeType(type: string): void {
    this.selectedTypes.update((types) => types.filter((item) => item !== type));
    this.resetAndLoad();
  }

  clearAllFilters(): void {
    if (this.clearingFilters()) {
      return;
    }

    this.clearingFilters.set(true);
    this.selectedTypes.set([]);
    this.searchQuery.set('');
    this.lastRouteType = null;
    this.resetAndLoad();
    window.setTimeout(() => this.clearingFilters.set(false), 400);
  }

  applySuggestedType(type: string): void {
    this.selectedTypes.set([type]);
    this.searchQuery.set('');
    this.resetAndLoad();
  }

  openBrowse(): void {
    void this.router.navigate(['/browse']);
  }

  onRefresh(event: RefresherCustomEvent): void {
    this.error.set(false);
    this.offset = 0;
    this.hasMore.set(true);

    this.pokemonService
      .getPokemonPage(this.getFilters(), 0, PAGE_SIZE)
      .subscribe({
        next: (result) => {
          this.pokemon.set(result.items);
          this.hasMore.set(result.hasMore);
          this.offset = result.items.length;
          this.loading.set(false);
          void event.target.complete();
          void this.haptics.lightImpact();
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
          void event.target.complete();
        },
      });
  }

  onInfiniteScroll(event: InfiniteScrollCustomEvent): void {
    void this.loadMore().finally(() => event.target.complete());
  }

  retry(): void {
    this.resetAndLoad();
  }

  dismissError(): void {
    this.error.set(false);
  }

  private resetAndLoad(): void {
    this.offset = 0;
    this.pokemon.set([]);
    this.hasMore.set(true);
    this.loadInitial();
  }

  private loadInitial(): void {
    this.loading.set(true);
    this.error.set(false);
    this.offset = 0;

    this.pokemonService
      .getPokemonPage(this.getFilters(), 0, PAGE_SIZE)
      .subscribe({
        next: (result) => {
          this.pokemon.set(result.items);
          this.hasMore.set(result.hasMore);
          this.offset = result.items.length;
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  private async loadMore(): Promise<void> {
    if (!this.hasMore() || this.loadingMore()) {
      return;
    }

    this.loadingMore.set(true);

    return new Promise((resolve) => {
      this.pokemonService
        .getPokemonPage(this.getFilters(), this.offset, PAGE_SIZE)
        .subscribe({
          next: (result) => {
            this.pokemon.update((items) => [...items, ...result.items]);
            this.hasMore.set(result.hasMore);
            this.offset += result.items.length;
            this.loadingMore.set(false);
            resolve();
          },
          error: () => {
            this.loadingMore.set(false);
            resolve();
          },
        });
    });
  }

  private getFilters() {
    return {
      search: this.searchQuery(),
      types: this.selectedTypes(),
    };
  }
}
