import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonSearchbar,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  flashOutline,
  shuffleOutline,
  swapHorizontalOutline,
  trophyOutline,
} from 'ionicons/icons';
import { getTypeColor } from '../../core/constants/design-tokens';
import {
  PokemonCardData,
  PokemonDetail,
  formatPokemonId,
  formatPokemonName,
  getPokemonSprite,
} from '../../core/models/pokemon.model';
import { HapticsService } from '../../core/services/haptics.service';
import { CompareSelectionService } from '../../core/services/compare-selection.service';
import { LanguageService } from '../../core/services/language.service';
import { PokemonService } from '../../core/services/pokemon.service';
import { CompareRadarChartComponent } from '../../shared/components/compare-radar-chart/compare-radar-chart.component';
import { ErrorRetryComponent } from '../../shared/components/error-retry/error-retry.component';
import { StatBarComponent } from '../../shared/components/stat-bar/stat-bar.component';
import { ScreenHeaderComponent } from '../../shared/components/screen-header/screen-header.component';
import type { StatRadarPoint } from '../../shared/components/stat-radar-chart/stat-radar-chart.component';
import { TypeChipComponent } from '../../shared/components/type-chip/type-chip.component';
import {
  StatNamePipe,
  TranslatePipe,
} from '../../shared/pipes/translate.pipe';

type CompareSide = 'left' | 'right';

interface MatchupScore {
  left: number;
  right: number;
  tied: number;
}

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [
    ScreenHeaderComponent,
    IonContent,
    IonSearchbar,
    IonButton,
    IonSpinner,
    IonIcon,
    TypeChipComponent,
    StatBarComponent,
    CompareRadarChartComponent,
    ErrorRetryComponent,
    TranslatePipe,
    StatNamePipe,
  ],
  templateUrl: './compare.page.html',
  styleUrl: './compare.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparePage implements OnInit, ViewWillEnter {
  private readonly pokemonService = inject(PokemonService);
  private readonly haptics = inject(HapticsService);
  private readonly compareSelection = inject(CompareSelectionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly lang = inject(LanguageService);
  private readonly search$ = new Subject<string>();

  readonly searchResults = signal<PokemonCardData[]>([]);
  readonly leftPokemon = signal<PokemonDetail | null>(null);
  readonly rightPokemon = signal<PokemonDetail | null>(null);
  readonly activeSide = signal<CompareSide>('left');
  readonly focusedStat = signal<string | null>(null);
  readonly duelPulse = signal(0);
  readonly loadingLeft = signal(false);
  readonly loadingRight = signal(false);
  readonly searching = signal(false);
  readonly randomizing = signal(false);
  readonly errorLeft = signal(false);
  readonly errorRight = signal(false);
  readonly lastLeftId = signal<number | null>(null);
  readonly lastRightId = signal<number | null>(null);
  readonly bothSelected = computed(
    () => !!this.leftPokemon() && !!this.rightPokemon(),
  );
  readonly matchupScore = computed<MatchupScore>(() =>
    this.calculateMatchupScore(),
  );
  readonly overallWinnerSide = computed<CompareSide | 'tie' | null>(() => {
    if (!this.bothSelected()) {
      return null;
    }
    const { left, right } = this.matchupScore();
    if (left === right) {
      return 'tie';
    }
    return left > right ? 'left' : 'right';
  });
  readonly leftBstShare = computed(() => {
    const left = this.getTotalStats(this.leftPokemon());
    const right = this.getTotalStats(this.rightPokemon());
    const total = left + right;
    return total ? Math.round((left / total) * 100) : 50;
  });

  formatPokemonName = formatPokemonName;
  formatPokemonId = formatPokemonId;

  constructor() {
    addIcons({ swapHorizontalOutline, shuffleOutline, trophyOutline, flashOutline });
  }

  ngOnInit(): void {
    this.search$
      .pipe(
        debounceTime(300),
        switchMap((value) => {
          if (!value.trim()) {
            this.searchResults.set([]);
            this.searching.set(false);
            return of([]);
          }
          this.searching.set(true);
          return this.pokemonService.searchPokemonByName(value).pipe(
            catchError(() => of([])),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.searchResults.set(results);
        this.searching.set(false);
      });
  }

  ionViewWillEnter(): void {
    const pending = this.compareSelection.consume();
    if (!pending) {
      return;
    }
    if (pending.left != null) {
      this.selectPokemon('left', pending.left);
    }
    if (pending.right != null) {
      this.selectPokemon('right', pending.right);
    }
  }

  sideLabel(side: CompareSide): string {
    return this.lang.t(side === 'left' ? 'compare.left' : 'compare.right');
  }

  activeSideLabel(): string {
    return this.sideLabel(this.activeSide());
  }

  primaryTypeColor(pokemon: PokemonDetail | null): string {
    if (!pokemon) {
      return 'var(--jublia-color-primary)';
    }
    return getTypeColor(pokemon.types[0]?.type.name ?? 'normal');
  }

  radarStats(pokemon: PokemonDetail): StatRadarPoint[] {
    return pokemon.stats.map((stat) => ({
      name: stat.stat.name,
      value: stat.base_stat,
    }));
  }

  winsLabel(side: CompareSide): string {
    const count = side === 'left' ? this.matchupScore().left : this.matchupScore().right;
    return this.lang.t('compare.winsScore', { count });
  }

  overallWinnerLabel(): string {
    const winner = this.overallWinnerSide();
    if (!winner || winner === 'tie') {
      return this.lang.t('compare.evenMatch');
    }
    const pokemon =
      winner === 'left' ? this.leftPokemon() : this.rightPokemon();
    return this.lang.t('compare.overallWinner', {
      name: pokemon ? formatPokemonName(pokemon.name) : '',
    });
  }

  formatHeight(pokemon: PokemonDetail | null): string {
    if (!pokemon) {
      return '—';
    }
    return `${pokemon.height / 10} m`;
  }

  formatWeight(pokemon: PokemonDetail | null): string {
    if (!pokemon) {
      return '—';
    }
    return `${pokemon.weight / 10} kg`;
  }

  isHeightWinner(side: CompareSide): boolean {
    const left = this.leftPokemon();
    const right = this.rightPokemon();
    if (!left || !right || left.height === right.height) {
      return false;
    }
    return side === 'left' ? left.height > right.height : right.height > left.height;
  }

  isWeightWinner(side: CompareSide): boolean {
    const left = this.leftPokemon();
    const right = this.rightPokemon();
    if (!left || !right || left.weight === right.weight) {
      return false;
    }
    return side === 'left' ? left.weight > right.weight : right.weight > left.weight;
  }

  isStatWinner(side: CompareSide, statName: string): boolean {
    const leftValue = this.getStatValue(this.leftPokemon(), statName);
    const rightValue = this.getStatValue(this.rightPokemon(), statName);
    if (leftValue === rightValue) {
      return false;
    }
    return side === 'left' ? leftValue > rightValue : rightValue > leftValue;
  }

  onSearch(event: CustomEvent): void {
    const value = (event.detail as { value?: string }).value ?? '';
    this.search$.next(value);
  }

  async focusSide(side: CompareSide): Promise<void> {
    if (this.activeSide() === side) {
      return;
    }
    this.activeSide.set(side);
    await this.haptics.lightImpact();
  }

  async toggleStatFocus(statName: string): Promise<void> {
    this.focusedStat.update((current) => (current === statName ? null : statName));
    await this.haptics.selectionChanged();
  }

  assignToActive(id: number): void {
    this.selectPokemon(this.activeSide(), id);
  }

  selectPokemon(side: CompareSide, id: number): void {
    void this.haptics.selectionChanged();
    this.activeSide.set(side);
    this.focusedStat.set(null);

    if (side === 'left') {
      this.lastLeftId.set(id);
      this.loadingLeft.set(true);
      this.errorLeft.set(false);
      this.pokemonService.getPokemonDetail(id).subscribe({
        next: (detail) => {
          this.leftPokemon.set(detail);
          this.loadingLeft.set(false);
          this.bumpDuelPulse();
          this.focusNextEmptySide('left');
        },
        error: () => {
          this.errorLeft.set(true);
          this.loadingLeft.set(false);
        },
      });
    } else {
      this.lastRightId.set(id);
      this.loadingRight.set(true);
      this.errorRight.set(false);
      this.pokemonService.getPokemonDetail(id).subscribe({
        next: (detail) => {
          this.rightPokemon.set(detail);
          this.loadingRight.set(false);
          this.bumpDuelPulse();
          this.focusNextEmptySide('right');
        },
        error: () => {
          this.errorRight.set(true);
          this.loadingRight.set(false);
        },
      });
    }

    this.searchResults.set([]);
  }

  pickRandomMatchup(): void {
    if (this.randomizing()) {
      return;
    }

    this.randomizing.set(true);
    this.focusedStat.set(null);
    void this.haptics.selectionChanged();

    this.pokemonService.getNameIndex().subscribe({
      next: (entries) => {
        if (entries.length < 2) {
          this.randomizing.set(false);
          return;
        }

        const shuffled = [...entries].sort(() => Math.random() - 0.5);
        const [left, right] = shuffled.slice(0, 2);
        this.selectPokemon('left', left.id);
        this.selectPokemon('right', right.id);
        this.randomizing.set(false);
      },
      error: () => {
        this.randomizing.set(false);
      },
    });
  }

  async swapSides(): Promise<void> {
    const left = this.leftPokemon();
    const right = this.rightPokemon();
    if (!left || !right) {
      return;
    }

    this.leftPokemon.set(right);
    this.rightPokemon.set(left);
    this.lastLeftId.set(right.id);
    this.lastRightId.set(left.id);
    this.bumpDuelPulse();
    await this.haptics.lightImpact();
  }

  retry(side: CompareSide): void {
    const id = side === 'left' ? this.lastLeftId() : this.lastRightId();
    if (id) {
      this.selectPokemon(side, id);
    }
  }

  clear(side: CompareSide, event?: Event): void {
    event?.stopPropagation();
    if (side === 'left') {
      this.leftPokemon.set(null);
      this.errorLeft.set(false);
    } else {
      this.rightPokemon.set(null);
      this.errorRight.set(false);
    }
    this.activeSide.set(side);
    this.focusedStat.set(null);
    void this.haptics.lightImpact();
  }

  getSprite(pokemon: PokemonDetail | null): string | null {
    return pokemon ? getPokemonSprite(pokemon) : null;
  }

  getStatValue(pokemon: PokemonDetail | null, statName: string): number {
    if (!pokemon) {
      return 0;
    }
    return (
      pokemon.stats.find((stat) => stat.stat.name === statName)?.base_stat ?? 0
    );
  }

  getStatNames(): string[] {
    const left = this.leftPokemon();
    const right = this.rightPokemon();
    const names = new Set<string>();
    left?.stats.forEach((stat) => names.add(stat.stat.name));
    right?.stats.forEach((stat) => names.add(stat.stat.name));
    return Array.from(names);
  }

  getTotalStats(pokemon: PokemonDetail | null): number {
    if (!pokemon) {
      return 0;
    }
    return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  }

  isTotalWinner(side: CompareSide): boolean {
    const leftTotal = this.getTotalStats(this.leftPokemon());
    const rightTotal = this.getTotalStats(this.rightPokemon());
    if (!leftTotal || !rightTotal || leftTotal === rightTotal) {
      return false;
    }
    return side === 'left' ? leftTotal > rightTotal : rightTotal > leftTotal;
  }

  private bumpDuelPulse(): void {
    if (this.bothSelected()) {
      this.duelPulse.update((value) => value + 1);
    }
  }

  private calculateMatchupScore(): MatchupScore {
    const left = this.leftPokemon();
    const right = this.rightPokemon();
    if (!left || !right) {
      return { left: 0, right: 0, tied: 0 };
    }

    let leftWins = 0;
    let rightWins = 0;
    let tied = 0;

    const compareMetric = (leftValue: number, rightValue: number): void => {
      if (leftValue === rightValue) {
        tied += 1;
      } else if (leftValue > rightValue) {
        leftWins += 1;
      } else {
        rightWins += 1;
      }
    };

    compareMetric(left.height, right.height);
    compareMetric(left.weight, right.weight);

    for (const statName of this.getStatNames()) {
      compareMetric(
        this.getStatValue(left, statName),
        this.getStatValue(right, statName),
      );
    }

    return { left: leftWins, right: rightWins, tied };
  }

  private focusNextEmptySide(assignedSide: CompareSide): void {
    const otherSide: CompareSide = assignedSide === 'left' ? 'right' : 'left';
    const otherPokemon =
      otherSide === 'left' ? this.leftPokemon() : this.rightPokemon();
    if (!otherPokemon) {
      this.activeSide.set(otherSide);
    }
  }
}
