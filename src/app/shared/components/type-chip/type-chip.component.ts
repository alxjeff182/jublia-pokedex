import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonChip, IonLabel } from '@ionic/angular/standalone';
import { getTypeColor } from '../../../core/constants/design-tokens';
import { formatPokemonName } from '../../../core/models/pokemon.model';

@Component({
  selector: 'app-type-chip',
  standalone: true,
  imports: [IonChip, IonLabel],
  template: `
    <ion-chip
      class="type-chip"
      [style.--background]="color"
      [style.--color]="'#ffffff'"
    >
      <ion-label>{{ label }}</ion-label>
    </ion-chip>
  `,
  styleUrl: './type-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeChipComponent {
  @Input({ required: true }) type!: string;

  get label(): string {
    return formatPokemonName(this.type);
  }

  get color(): string {
    return getTypeColor(this.type);
  }
}
