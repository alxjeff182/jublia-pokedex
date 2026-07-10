import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
  heart,
  searchOutline,
  shareOutline,
} from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { forkJoin } from 'rxjs';
import { getTypeColor } from '../../core/constants/design-tokens';
import {
  EvolutionNode,
  MoveLearnFilter,
  PokemonDetail,
  PokemonMoveEntry,
  formatLearnMethod,
  formatPokemonId,
  formatPokemonName,
  getPokemonSprite,
  normalizePokemonMoves,
} from '../../core/models/pokemon.model';
import { FavoritesService } from '../../core/services/favorites.service';
import { HapticsService } from '../../core/services/haptics.service';
import { PokemonService } from '../../core/services/pokemon.service';
import { ErrorRetryComponent } from '../../shared/components/error-retry/error-retry.component';
import { ScreenHeaderComponent } from '../../shared/components/screen-header/screen-header.component';
import { StatBarComponent } from '../../shared/components/stat-bar/stat-bar.component';
import type { StatRadarPoint } from '../../shared/components/stat-radar-chart/stat-radar-chart.component';
import { TypeChipComponent } from '../../shared/components/type-chip/type-chip.component';

const MOVE_FILTER_OPTIONS: Array<{ id: MoveLearnFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'level-up', label: 'Level Up' },
  { id: 'machine', label: 'TM / HM' },
  { id: 'egg', label: 'Egg' },
  { id: 'tutor', label: 'Tutor' },
];

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

  readonly moveFilterOptions = MOVE_FILTER_OPTIONS;
  readonly formatLearnMethod = formatLearnMethod;

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
      shareOutline,
      chevronBackOutline,
      chevronForward,
      arrowForward,
      closeOutline,
      searchOutline,
      chevronDown,
      chevronUp,
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
      const id = Number(params.get('id'));
      if (!id) {
        void this.router.navigateByUrl('/tabs/home');
        return;
      }
      this.loadPokemon(id);
    });
  }

  get displayName(): string {
    const pokemon = this.pokemon();
    return pokemon ? formatPokemonName(pokemon.name) : '';
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
    const summary = formatLearnMethod(move.primaryMethod);
    if (move.primaryMethod === 'level-up' && move.minLevel !== null) {
      return `${summary} · Lv. ${move.minLevel}`;
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

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    void this.router.navigateByUrl('/tabs/home');
  }

  async sharePokemon(): Promise<void> {
    const pokemon = this.pokemon();
    if (!pokemon) {
      return;
    }

    const title = this.displayName;
    const text = `Check out ${title} (${this.displayId}) on JUBLIA Dex!`;
    const url = window.location.href;

    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({ title, text, url, dialogTitle: 'Share Pokémon' });
        return;
      }

      if (typeof navigator.share === 'function') {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(`${text}\n${url}`);
      await this.presentToast('Link copied to clipboard');
    } catch {
      await this.presentToast('Unable to share right now');
    }
  }

  openPokemon(id: number): void {
    void this.router.navigate(['/tabs/pokemon', id]);
  }

  retry(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadPokemon(id);
    }
  }

  dismissError(): void {
    this.error.set(false);
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }

  private loadPokemon(id: number): void {
    this.loading.set(true);
    this.error.set(false);
    this.abilitiesOpen.set(false);
    this.closeMovesModal();

    forkJoin({
      detail: this.pokemonService.getPokemonDetail(id),
      evolution: this.pokemonService.getEvolutionChain(id),
      flavor: this.pokemonService.getFlavorText(id),
    }).subscribe({
      next: ({ detail, evolution }) => {
        this.pokemon.set(detail);
        this.evolution.set(evolution);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
