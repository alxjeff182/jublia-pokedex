import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { IonChip } from '@ionic/angular/standalone';
import { getTypeColor } from '../../../core/constants/design-tokens';
import { TypeNamePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-type-chip',
  standalone: true,
  imports: [IonChip, TypeNamePipe],
  template: `
    <ion-chip
      class="type-chip"
      [style.--background]="color"
      [style.--color]="'#ffffff'"
    >
      {{ type | typeName }}
    </ion-chip>
  `,
  styleUrl: './type-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeChipComponent {
  @Input({ required: true }) type!: string;

  get color(): string {
    return getTypeColor(this.type);
  }
}
