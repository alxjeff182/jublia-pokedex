import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, moon, shareOutline, sunny } from 'ionicons/icons';
import { ThemeService } from '../../../core/services/theme.service';

export type ScreenHeaderVariant = 'default' | 'overlay' | 'brand';

@Component({
  selector: 'app-screen-header',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonTitle, IonToggle],
  templateUrl: './screen-header.component.html',
  styleUrl: './screen-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenHeaderComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  protected readonly theme = inject(ThemeService);

  @Input() title = '';
  @Input() showBrand = false;
  @Input() backHref?: string;
  @Input() showBack = false;
  @Input() variant: ScreenHeaderVariant = 'default';
  @Input() rightIcon?: string;
  @Input() rightAriaLabel = '';
  @Input() showPokeball = false;
  @Input() showThemeToggle = true;

  @Output() backClick = new EventEmitter<void>();
  @Output() rightClick = new EventEmitter<void>();
  @Output() pokeballClick = new EventEmitter<void>();

  @Input() pokeballHref = '/tabs/home';

  constructor() {
    addIcons({ chevronBackOutline, shareOutline, sunny, moon });
  }

  get hasBack(): boolean {
    return this.showBack || !!this.backHref;
  }

  get isBrand(): boolean {
    return this.showBrand || this.variant === 'brand';
  }

  get isOverlay(): boolean {
    return this.variant === 'overlay';
  }

  get hasEndAction(): boolean {
    return (
      !!this.rightIcon ||
      (this.showPokeball && !this.isBrand) ||
      (this.showThemeToggle && !this.isBrand)
    );
  }

  async onThemeToggle(event: CustomEvent): Promise<void> {
    const checked = (event.detail as { checked: boolean }).checked;
    await this.theme.setPreference(checked ? 'dark' : 'light');
  }

  onBackClick(): void {
    if (this.backClick.observed) {
      this.backClick.emit();
      return;
    }

    if (!this.backHref) {
      return;
    }

    if (window.history.length > 1) {
      this.location.back();
      return;
    }

    void this.router.navigateByUrl(this.backHref);
  }

  onRightClick(): void {
    this.rightClick.emit();
  }

  onPokeballClick(): void {
    if (this.pokeballClick.observed) {
      this.pokeballClick.emit();
      return;
    }

    void this.router.navigateByUrl(this.pokeballHref);
  }
}
