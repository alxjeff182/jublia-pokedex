import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Input,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { flashOutline, gitCompareOutline, shuffleOutline, swapHorizontalOutline } from 'ionicons/icons';
import { getTypeColor } from '../../../core/constants/design-tokens';
import { formatPokemonName } from '../../../core/models/pokemon.model';
import { CompareSelectionService } from '../../../core/services/compare-selection.service';
import { HapticsService } from '../../../core/services/haptics.service';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface PromoFighter {
  id: number;
  name: string;
  bst: number;
  type: string;
}

interface PromoMatchup {
  left: PromoFighter;
  right: PromoFighter;
}

const SHOWCASE_MATCHUPS: PromoMatchup[] = [
  {
    left: { id: 25, name: 'pikachu', bst: 320, type: 'electric' },
    right: { id: 6, name: 'charizard', bst: 534, type: 'fire' },
  },
  {
    left: { id: 1, name: 'bulbasaur', bst: 318, type: 'grass' },
    right: { id: 7, name: 'squirtle', bst: 314, type: 'water' },
  },
  {
    left: { id: 94, name: 'gengar', bst: 500, type: 'ghost' },
    right: { id: 65, name: 'alakazam', bst: 500, type: 'psychic' },
  },
  {
    left: { id: 150, name: 'mewtwo', bst: 680, type: 'psychic' },
    right: { id: 151, name: 'mew', bst: 600, type: 'psychic' },
  },
  {
    left: { id: 384, name: 'rayquaza', bst: 680, type: 'dragon' },
    right: { id: 383, name: 'groudon', bst: 670, type: 'ground' },
  },
];

const ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

@Component({
  selector: 'app-compare-promo',
  standalone: true,
  imports: [IonButton, IonIcon, TranslatePipe],
  templateUrl: './compare-promo.component.html',
  styleUrl: './compare-promo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparePromoComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly compareSelection = inject(CompareSelectionService);
  private readonly haptics = inject(HapticsService);
  private readonly lang = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() variant: 'hero' | 'compact' = 'hero';
  @Input() titleKey = 'compare.promoTitle';
  @Input() bodyKey = 'compare.promoBody';
  @Input() ctaKey = 'compare.promoCta';
  @Input() leftPokemonId?: number;
  @Input() rightPokemonId?: number;
  @Input() leftPokemonName?: string;
  @Input() rightPokemonName?: string;

  readonly matchupIndex = signal(0);
  readonly swapped = signal(false);
  readonly arenaPulse = signal(0);
  readonly userPausedAuto = signal(false);

  readonly customMode = computed(
    () => this.leftPokemonId != null || this.rightPokemonId != null,
  );

  readonly showcaseMatchup = computed(() => {
    const index = this.matchupIndex() % SHOWCASE_MATCHUPS.length;
    return SHOWCASE_MATCHUPS[index];
  });

  readonly leftFighter = computed((): PromoFighter | null => {
    if (this.customMode()) {
      if (this.leftPokemonId == null) {
        return null;
      }
      return {
        id: this.leftPokemonId,
        name: this.leftPokemonName ?? `pokemon-${this.leftPokemonId}`,
        bst: 0,
        type: 'normal',
      };
    }
    const matchup = this.showcaseMatchup();
    return this.swapped() ? matchup.right : matchup.left;
  });

  readonly rightFighter = computed((): PromoFighter | null => {
    if (this.customMode()) {
      if (this.rightPokemonId == null) {
        return null;
      }
      return {
        id: this.rightPokemonId,
        name: this.rightPokemonName ?? `pokemon-${this.rightPokemonId}`,
        bst: 0,
        type: 'normal',
      };
    }
    const matchup = this.showcaseMatchup();
    return this.swapped() ? matchup.left : matchup.right;
  });

  readonly leftBstShare = computed(() => {
    const left = this.leftFighter()?.bst ?? 0;
    const right = this.rightFighter()?.bst ?? 0;
    if (!left && !right) {
      return 50;
    }
    const total = left + right;
    return total ? Math.round((left / total) * 100) : 50;
  });

  readonly leaderLabel = computed(() => {
    this.lang.locale();
    const left = this.leftFighter();
    const right = this.rightFighter();
    if (this.customMode()) {
      if (!right) {
        return this.lang.t('compare.promoPickRival');
      }
      return this.lang.t('compare.duelReady');
    }
    if (!left || !right) {
      return this.lang.t('compare.promoTapShuffle');
    }
    if (left.bst === right.bst) {
      return this.lang.t('compare.evenMatch');
    }
    const winner = left.bst > right.bst ? left : right;
    return this.lang.t('compare.overallWinner', {
      name: formatPokemonName(winner.name),
    });
  });

  readonly leftAccent = computed(() => getTypeColor(this.leftFighter()?.type ?? 'normal'));
  readonly rightAccent = computed(() => getTypeColor(this.rightFighter()?.type ?? 'normal'));

  private autoTimer: ReturnType<typeof setInterval> | null = null;
  private resumeTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    addIcons({ gitCompareOutline, shuffleOutline, swapHorizontalOutline, flashOutline });
  }

  ngOnInit(): void {
    this.autoTimer = setInterval(() => {
      if (!this.customMode() && !this.userPausedAuto()) {
        this.advanceMatchup(false);
      }
    }, 5500);

    this.destroyRef.onDestroy(() => {
      if (this.autoTimer) {
        clearInterval(this.autoTimer);
      }
      if (this.resumeTimer) {
        clearTimeout(this.resumeTimer);
      }
    });
  }

  displayName(fighter: PromoFighter | null): string {
    if (!fighter) {
      return '';
    }
    if (this.customMode() && !this.leftPokemonName && !this.rightPokemonName) {
      return `#${String(fighter.id).padStart(3, '0')}`;
    }
    return formatPokemonName(fighter.name);
  }

  spriteUrl(id: number): string {
    return `${ARTWORK_BASE}/${id}.png`;
  }

  shuffleMatchup(event?: Event): void {
    event?.stopPropagation();
    if (this.customMode()) {
      this.openCompare();
      return;
    }
    this.pauseAuto();
    this.advanceMatchup(true);
  }

  swapSides(event?: Event): void {
    event?.stopPropagation();
    if (this.customMode()) {
      return;
    }
    this.swapped.update((value) => !value);
    this.bumpArena();
    void this.haptics.selectionChanged();
  }

  openCompare(): void {
    const left = this.leftFighter();
    const right = this.rightFighter();
    if (left) {
      this.compareSelection.queue('left', left.id);
    }
    if (right) {
      this.compareSelection.queue('right', right.id);
    }
    void this.haptics.lightImpact();
    void this.router.navigate(['/compare']);
  }

  private advanceMatchup(withHaptic: boolean): void {
    this.matchupIndex.update((index) => (index + 1) % SHOWCASE_MATCHUPS.length);
    this.swapped.set(false);
    this.bumpArena();
    if (withHaptic) {
      void this.haptics.selectionChanged();
    }
  }

  private bumpArena(): void {
    this.arenaPulse.update((value) => value + 1);
  }

  private pauseAuto(): void {
    this.userPausedAuto.set(true);
    if (this.resumeTimer) {
      clearTimeout(this.resumeTimer);
    }
    this.resumeTimer = setTimeout(() => this.userPausedAuto.set(false), 12000);
  }
}
