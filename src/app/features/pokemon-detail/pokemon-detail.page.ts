import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  Type,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonSearchbar,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  chevronBackOutline,
  chevronDown,
  chevronForward,
  chevronUp,
  closeOutline,
  gitCompareOutline,
  heart,
  searchOutline,
  shareOutline,
} from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getTypeColor } from '../../core/constants/design-tokens';
import {
  EvolutionNode,
  MoveLearnFilter,
  PokemonDetail,
  PokemonMoveEntry,
  formatPokemonId,
  formatPokemonName,
  getPokemonSprite,
  normalizePokemonMoves,
  pokemonDetailRoute,
  toPokemonSlug,
} from '../../core/models/pokemon.model';
import { CompareSelectionService } from '../../core/services/compare-selection.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { HapticsService } from '../../core/services/haptics.service';
import { LanguageService } from '../../core/services/language.service';
import { PokemonService } from '../../core/services/pokemon.service';
import { SeoService } from '../../core/services/seo.service';
import { ErrorRetryComponent } from '../../shared/components/error-retry/error-retry.component';
import { ScreenHeaderComponent } from '../../shared/components/screen-header/screen-header.component';
import { StatBarComponent } from '../../shared/components/stat-bar/stat-bar.component';
import type { StatRadarPoint } from '../../shared/components/stat-radar-chart/stat-radar-chart.component';
import { TypeChipComponent } from '../../shared/components/type-chip/type-chip.component';
import {
  LearnMethodPipe,
  TranslatePipe,
} from '../../shared/pipes/translate.pipe';

const MOVE_FILTER_IDS: MoveLearnFilter[] = ['all', 'level-up', 'machine', 'egg', 'tutor'];

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonIcon,
    IonSpinner,
    IonModal,
    IonSearchbar,
    IonChip,
    IonList,
    IonItem,
    IonLabel,
    TypeChipComponent,
    StatBarComponent,
    NgComponentOutlet,
    ErrorRetryComponent,
    ScreenHeaderComponent,
    TranslatePipe,
    LearnMethodPipe,
  ],
  templateUrl: './pokemon-detail.page.html',
  styleUrl: './pokemon-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly pokemonService = inject(PokemonService);
  private readonly toastController = inject(ToastController);
  private readonly haptics = inject(HapticsService);
  readonly favorites = inject(FavoritesService);
  private readonly lang = inject(LanguageService);
  private readonly seo = inject(SeoService);
  private readonly compareSelection = inject(CompareSelectionService);

  readonly moveFilterOptions = computed(() => {
    this.lang.locale();
    return MOVE_FILTER_IDS.map((id) => ({
      id,
      label: this.moveFilterLabel(id),
    }));
  });
  readonly formatLearnMethod = (method: string): string =>
    this.lang.translateLearnMethod(method);

  readonly movesCountLabel = computed(() => {
    this.lang.locale();
    const pokemon = this.pokemon();
    const count = pokemon ? normalizePokemonMoves(pokemon.moves).length : 0;
    return this.lang.t('detail.movesCount', { count });
  });

  readonly movesResultLabel = computed(() => {
    this.lang.locale();
    return this.lang.t('detail.movesResult', {
      filtered: this.filteredMoves().length,
      total: this.moveEntries().length,
    });
  });

  readonly movesModalTitle = computed(() => {
    this.lang.locale();
    return this.lang.t('detail.movesTitle', { name: this.displayName });
  });

  readonly favoriteAriaLabel = computed(() => {
    this.lang.locale();
    this.pokemon();
    return this.isFavorite()
      ? this.lang.t('detail.removeFavorite')
      : this.lang.t('detail.addFavorite');
  });

  readonly pokemon = signal<PokemonDetail | null>(null);
  readonly evolution = signal<EvolutionNode[]>([]);
  readonly abilitiesOpen = signal(false);
  readonly movesModalOpen = signal(false);
  readonly moveSearch = signal('');
  readonly moveFilter = signal<MoveLearnFilter>('all');
  readonly selectedMove = signal<string | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly radarChartComponent = signal<Type<unknown> | null>(null);

  readonly moveEntries = computed(() => {
    const pokemon = this.pokemon();
    return pokemon ? normalizePokemonMoves(pokemon.moves) : [];
  });

  readonly filteredMoves = computed(() => {
    const query = this.moveSearch().trim().toLowerCase();
    const filter = this.moveFilter();

    return this.moveEntries().filter((move) => {
      const matchesFilter =
        filter === 'all' || move.learnMethods.includes(filter);
      const matchesQuery =
        !query ||
        move.label.toLowerCase().includes(query) ||
        move.name.includes(query);

      return matchesFilter && matchesQuery;
    });
  });

  constructor() {
    addIcons({
      heart,
      gitCompareOutline,
      shareOutline,
      chevronBackOutline,
      chevronForward,
      arrowForward,
      closeOutline,
      searchOutline,
      chevronDown,
      chevronUp,
    });

    inject(DestroyRef).onDestroy(() => {
      this.seo.setJsonLd(null);
    });

    void import('../../shared/components/stat-radar-chart/stat-radar-chart.component').then(
      (module) => {
        this.radarChartComponent.set(module.StatRadarChartComponent);
      },
    );
  }

  formatPokemonName = formatPokemonName;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = toPokemonSlug(params.get('slug') ?? '');
      if (!slug) {
        void this.router.navigateByUrl('/');
        return;
      }
      this.loadPokemon(slug);
    });
  }

  get displayName(): string {
    const pokemon = this.pokemon();
    return pokemon ? formatPokemonName(pokemon.name) : '';
  }

  get headerTitle(): string {
    const pokemon = this.pokemon();
    if (pokemon) {
      return formatPokemonName(pokemon.name);
    }

    const slug = toPokemonSlug(this.route.snapshot.paramMap.get('slug') ?? '');
    return slug ? formatPokemonName(slug) : '';
  }

  get displayId(): string {
    const pokemon = this.pokemon();
    return pokemon ? formatPokemonId(pokemon.id) : '';
  }

  get sprite(): string | null {
    const pokemon = this.pokemon();
    return pokemon ? getPokemonSprite(pokemon) : null;
  }

  get headerColor(): string {
    const pokemon = this.pokemon();
    const primaryType = pokemon?.types[0]?.type.name;
    return primaryType ? getTypeColor(primaryType) : 'var(--jublia-color-primary)';
  }

  isFavorite(): boolean {
    const pokemon = this.pokemon();
    return pokemon ? this.favorites.isFavorite(pokemon.id) : false;
  }

  radarStats(detail: PokemonDetail): StatRadarPoint[] {
    return detail.stats.map((stat) => ({
      name: stat.stat.name,
      value: stat.base_stat,
    }));
  }

  formatAbilityName(name: string): string {
    return formatPokemonName(name);
  }

  evolutionColor(node: EvolutionNode): string {
    return node.primaryType
      ? getTypeColor(node.primaryType)
      : this.headerColor;
  }

  moveLearnSummary(move: PokemonMoveEntry): string {
    const summary = this.lang.translateLearnMethod(move.primaryMethod);
    if (move.primaryMethod === 'level-up' && move.minLevel !== null) {
      return `${summary} · ${this.lang.t('detail.levelShort')} ${move.minLevel}`;
    }
    return summary;
  }

  toggleAbilities(): void {
    this.abilitiesOpen.update((open) => !open);
  }

  openMovesModal(): void {
    this.moveSearch.set('');
    this.moveFilter.set('all');
    this.selectedMove.set(null);
    this.movesModalOpen.set(true);
  }

  closeMovesModal(): void {
    this.movesModalOpen.set(false);
    this.selectedMove.set(null);
  }

  onMoveSearch(event: CustomEvent): void {
    const value = (event.detail as { value?: string }).value ?? '';
    this.moveSearch.set(value);
    this.selectedMove.set(null);
  }

  setMoveFilter(filter: MoveLearnFilter): void {
    this.moveFilter.set(filter);
    this.selectedMove.set(null);
  }

  toggleMoveDetail(moveName: string): void {
    this.selectedMove.update((current) =>
      current === moveName ? null : moveName,
    );
  }

  async toggleFavorite(): Promise<void> {
    const pokemon = this.pokemon();
    if (pokemon) {
      await this.favorites.toggleFavorite(pokemon.id);
      await this.haptics.lightImpact();
    }
  }

  openCompare(): void {
    const pokemon = this.pokemon();
    if (!pokemon) {
      return;
    }
    this.compareSelection.queue('left', pokemon.id);
    void this.router.navigate(['/compare']);
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    void this.router.navigateByUrl('/');
  }

  async sharePokemon(): Promise<void> {
    const pokemon = this.pokemon();
    if (!pokemon) {
      return;
    }

    const title = this.displayName;
    const text = this.lang.t('detail.shareText', {
      name: title,
      id: this.displayId,
    });
    const url = window.location.href;

    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title,
          text,
          url,
          dialogTitle: this.lang.t('detail.shareDialogTitle'),
        });
        return;
      }

      if (typeof navigator.share === 'function') {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(`${text}\n${url}`);
      await this.presentToast(this.lang.t('detail.linkCopied'));
    } catch {
      await this.presentToast(this.lang.t('detail.shareFailed'));
    }
  }

  openPokemon(name: string): void {
    void this.router.navigate(pokemonDetailRoute(name));
  }

  retry(): void {
    const slug = toPokemonSlug(this.route.snapshot.paramMap.get('slug') ?? '');
    if (slug) {
      this.loadPokemon(slug);
    }
  }

  dismissError(): void {
    this.error.set(false);
  }

  private moveFilterLabel(id: MoveLearnFilter): string {
    const keys: Record<MoveLearnFilter, string> = {
      all: 'detail.filterAll',
      'level-up': 'detail.filterLevelUp',
      machine: 'detail.filterMachine',
      egg: 'detail.filterEgg',
      tutor: 'detail.filterTutor',
    };
    return this.lang.t(keys[id]);
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  private updatePokemonSeo(detail: PokemonDetail, flavor: string): void {
    const name = formatPokemonName(detail.name);
    const types = detail.types
      .map((slot) => this.lang.translateType(slot.type.name))
      .join(' / ');
    const height = (detail.height / 10).toFixed(1);
    const weight = (detail.weight / 10).toFixed(1);
    const description = this.lang.t('seo.pokemonDetail', {
      name,
      types,
      id: formatPokemonId(detail.id).replace('#', ''),
      height,
      weight,
      flavor: flavor || this.lang.t('seo.pokemonFallback'),
    });
    const canonicalUrl = this.seo.buildUrl(`/pokemon/${detail.name}`);
    const image = getPokemonSprite(detail) ?? undefined;
    const baseTitle = this.lang.t('titles.app');
    const fullTitle = `${baseTitle} — ${name}`;

    this.seo.updateTags({
      title: fullTitle,
      description,
      url: canonicalUrl,
      image,
      type: 'article',
    });
    this.seo.updateCanonical(canonicalUrl);
    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Thing',
          name,
          image,
          description,
          url: canonicalUrl,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: this.lang.t('titles.home'),
              item: this.seo.buildUrl('/'),
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: this.lang.t('titles.pokemon'),
              item: this.seo.buildUrl('/'),
            },
            {
              '@type': 'ListItem',
              position: 3,
              name,
              item: canonicalUrl,
            },
          ],
        },
      ],
    });
  }

  private loadPokemon(slug: string): void {
    this.loading.set(true);
    this.error.set(false);
    this.abilitiesOpen.set(false);
    this.closeMovesModal();

    this.pokemonService
      .getPokemonDetail(slug)
      .pipe(
        switchMap((detail) =>
          forkJoin({
            detail: of(detail),
            evolution: this.pokemonService.getEvolutionChain(detail.id),
            flavor: this.pokemonService.getFlavorText(detail.id),
          }),
        ),
      )
      .subscribe({
        next: ({ detail, evolution, flavor }) => {
          if (detail.name !== slug) {
            void this.router.navigate(pokemonDetailRoute(detail.name), {
              replaceUrl: true,
            });
          }

          this.pokemon.set(detail);
          this.evolution.set(evolution);
          this.loading.set(false);
          this.updatePokemonSeo(detail, flavor);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
}
