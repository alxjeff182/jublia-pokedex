import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-theme-pill-toggle',
  standalone: true,
  imports: [IonIcon, TranslatePipe],
  templateUrl: './theme-pill-toggle.component.html',
  styleUrl: './theme-pill-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePillToggleComponent {
  protected readonly theme = inject(ThemeService);

  @Input() compact = false;
  @Input() overlay = false;

  constructor() {
    addIcons({ sunnyOutline, moonOutline });
  }

  async onToggle(): Promise<void> {
    await this.theme.toggleDarkMode();
  }
}
