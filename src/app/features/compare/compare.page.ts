import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import {
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSpinner,
  IonToolbar,
} from '@ionic/angular/standalone';
import {
  PokemonCardData,
  PokemonDetail,
  formatPokemonId,
  formatPokemonName,
  getPokemonSprite,
} from '../../core/models/pokemon.model';
import { HapticsService } from '../../core/services/haptics.service';
import { PokemonService } from '../../core/services/pokemon.service';
import { ErrorRetryComponent } from '../../shared/components/error-retry/error-retry.component';
import { StatBarComponent } from '../../shared/components/stat-bar/stat-bar.component';
import { ScreenHeaderComponent } from '../../shared/components/screen-header/screen-header.component';
import { TypeChipComponent } from '../../shared/components/type-chip/type-chip.component';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [
    ScreenHeaderComponent,
    IonToolbar,
    IonContent,
    IonSearchbar,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonSpinner,
    TypeChipComponent,
    StatBarComponent,
    ErrorRetryComponent,
  ],
  templateUrl: './compare.page.html',
  styleUrl: './compare.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparePage implements OnInit {
  private readonly pokemonService = inject(PokemonService);
  private readonly haptics = inject(HapticsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly search$ = new Subject<string>();

  readonly searchResults = signal<PokemonCardData[]>([]);
  readonly leftPokemon = signal<PokemonDetail | null>(null);
  readonly rightPokemon = signal<PokemonDetail | null>(null);
  readonly loadingLeft = signal(false);
  readonly loadingRight = signal(false);
  readonly searching = signal(false);
  readonly errorLeft = signal(false);
  readonly errorRight = signal(false);
  readonly lastLeftId = signal<number | null>(null);
  readonly lastRightId = signal<number | null>(null);

  formatPokemonName = formatPokemonName;
  formatPokemonId = formatPokemonId;

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

  isHeightWinner(side: 'left' | 'right'): boolean {
    const left = this.leftPokemon();
    const right = this.rightPokemon();
    if (!left || !right || left.height === right.height) {
      return false;
    }
    return side === 'left' ? left.height > right.height : right.height > left.height;
  }

  isWeightWinner(side: 'left' | 'right'): boolean {
    const left = this.leftPokemon();
    const right = this.rightPokemon();
    if (!left || !right || left.weight === right.weight) {
      return false;
    }
    return side === 'left' ? left.weight > right.weight : right.weight > left.weight;
  }

  isStatWinner(side: 'left' | 'right', statName: string): boolean {
    const leftValue = this.getStatValue(this.leftPokemon(), statName);
    const rightValue = this.getStatValue(this.rightPokemon(), statName);
    if (leftValue === rightValue) {
      return false;
    }
    return side === 'left' ? leftValue > rightValue : rightValue > leftValue;
  }

  winnerLabel(side: 'left' | 'right', statName: string): string {
    const pokemon = side === 'left' ? this.leftPokemon() : this.rightPokemon();
    if (!pokemon || !this.isStatWinner(side, statName)) {
      return '';
    }
    return `${formatPokemonName(pokemon.name)} wins`;
  }

  onSearch(event: CustomEvent): void {
    const value = (event.detail as { value?: string }).value ?? '';
    this.search$.next(value);
  }

  selectPokemon(side: 'left' | 'right', id: number): void {
    void this.haptics.selectionChanged();
    if (side === 'left') {
      this.lastLeftId.set(id);
      this.loadingLeft.set(true);
      this.errorLeft.set(false);
      this.pokemonService.getPokemonDetail(id).subscribe({
        next: (detail) => {
          this.leftPokemon.set(detail);
          this.loadingLeft.set(false);
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
        },
        error: () => {
          this.errorRight.set(true);
          this.loadingRight.set(false);
        },
      });
    }
    this.searchResults.set([]);
  }

  retry(side: 'left' | 'right'): void {
    const id = side === 'left' ? this.lastLeftId() : this.lastRightId();
    if (id) {
      this.selectPokemon(side, id);
    }
  }

  clear(side: 'left' | 'right'): void {
    if (side === 'left') {
      this.leftPokemon.set(null);
      this.errorLeft.set(false);
    } else {
      this.rightPokemon.set(null);
      this.errorRight.set(false);
    }
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
}
