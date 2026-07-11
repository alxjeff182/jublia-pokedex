import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonCard, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart } from 'ionicons/icons';
import { getTypeAuraGradient, getTypeAuraGradientOuter } from '../../../core/constants/design-tokens';
import {
  PokemonCardData,
  formatPokemonId,
  formatPokemonName,
  pokemonDetailRoute,
} from '../../../core/models/pokemon.model';
import { FavoritesService } from '../../../core/services/favorites.service';
import { HapticsService } from '../../../core/services/haptics.service';
import { TypeChipComponent } from '../type-chip/type-chip.component';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [IonCard, IonButton, IonIcon, TypeChipComponent],
  templateUrl: './pokemon-card.component.html',
  styleUrl: './pokemon-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonCardComponent {
  @Input({ required: true }) pokemon!: PokemonCardData;
  @Output() favoriteToggled = new EventEmitter<number>();

  private readonly router = inject(Router);
  private readonly haptics = inject(HapticsService);
  readonly favorites = inject(FavoritesService);
  readonly favoritePop = signal(false);

  constructor() {
    addIcons({ heart });
  }

  get displayName(): string {
    return formatPokemonName(this.pokemon.name);
  }

  get displayId(): string {
    return formatPokemonId(this.pokemon.id);
  }

  get auraBackground(): string {
    const primaryType = this.pokemon.types[0] ?? 'normal';
    return getTypeAuraGradient(primaryType);
  }

  get auraBackgroundOuter(): string {
    const primaryType = this.pokemon.types[0] ?? 'normal';
    return getTypeAuraGradientOuter(primaryType);
  }

  isFavorite(): boolean {
    return this.favorites.isFavorite(this.pokemon.id);
  }

  openDetail(event: Event): void {
    void this.router.navigate(pokemonDetailRoute(this.pokemon.name));
  }

  async toggleFavorite(event: Event): Promise<void> {
    event.stopPropagation();
    await this.favorites.toggleFavorite(this.pokemon.id);
    await this.haptics.lightImpact();
    this.favoritePop.set(true);
    window.setTimeout(() => this.favoritePop.set(false), 350);
    this.favoriteToggled.emit(this.pokemon.id);
  }
}
