import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonProgressBar } from '@ionic/angular/standalone';
import { formatPokemonName } from '../../../core/models/pokemon.model';

@Component({
  selector: 'app-stat-bar',
  standalone: true,
  imports: [IonProgressBar],
  templateUrl: './stat-bar.component.html',
  styleUrl: './stat-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatBarComponent {
  @Input({ required: true }) name!: string;
  @Input({ required: true }) value!: number;
  @Input() max = 255;
  @Input() highlight = false;
  @Input() compact = false;
  @Input() mutedValue = false;

  get label(): string {
    return formatPokemonName(this.name);
  }

  get ratio(): number {
    return Math.min(this.value / this.max, 1);
  }
}
