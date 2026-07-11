import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronForward } from 'ionicons/icons';
import { getTypeColor } from '../../core/constants/design-tokens';
import {
  POKEMON_TYPES,
  PokemonTypeName,
} from '../../core/models/pokemon.model';
import { HapticsService } from '../../core/services/haptics.service';
import { ScreenHeaderComponent } from '../../shared/components/screen-header/screen-header.component';
import { TranslatePipe, TypeNamePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [ScreenHeaderComponent, IonContent, IonIcon, TranslatePipe, TypeNamePipe],
  templateUrl: './browse.page.html',
  styleUrl: './browse.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrowsePage {
  private readonly router = inject(Router);
  private readonly haptics = inject(HapticsService);

  readonly types = POKEMON_TYPES;
  readonly pressedType = signal<PokemonTypeName | null>(null);

  constructor() {
    addIcons({ chevronForward });
  }

  typeColor(type: PokemonTypeName): string {
    return getTypeColor(type);
  }

  openType(type: PokemonTypeName): void {
    this.pressedType.set(type);
    void this.haptics.selectionChanged();
    window.setTimeout(() => {
      void this.router.navigate(['/'], {
        queryParams: { type },
      });
      this.pressedType.set(null);
    }, 160);
  }
}
