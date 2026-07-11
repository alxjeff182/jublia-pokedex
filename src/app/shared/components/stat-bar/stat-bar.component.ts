import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { IonProgressBar } from '@ionic/angular/standalone';
import { LanguageService } from '../../../core/services/language.service';
import { StatNamePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-stat-bar',
  standalone: true,
  imports: [IonProgressBar, StatNamePipe],
  templateUrl: './stat-bar.component.html',
  styleUrl: './stat-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatBarComponent {
  private readonly lang = inject(LanguageService);

  @Input({ required: true }) name!: string;
  @Input({ required: true }) value!: number;
  @Input() max = 255;
  @Input() highlight = false;
  @Input() compact = false;
  @Input() mutedValue = false;

  get label(): string {
    this.lang.locale();
    return this.lang.translateStat(this.name);
  }

  get ariaLabel(): string {
    this.lang.locale();
    return this.lang.t('common.outOf', {
      label: this.label,
      value: this.value,
      max: this.max,
    });
  }

  get ratio(): number {
    return Math.min(this.value / this.max, 1);
  }
}
