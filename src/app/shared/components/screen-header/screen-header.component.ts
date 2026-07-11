import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, shareOutline } from 'ionicons/icons';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ThemePillToggleComponent } from '../theme-pill-toggle/theme-pill-toggle.component';

export type ScreenHeaderVariant = 'default' | 'overlay' | 'brand';

@Component({
  selector: 'app-screen-header',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    TranslatePipe,
    ThemePillToggleComponent,
  ],
  templateUrl: './screen-header.component.html',
  styleUrl: './screen-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScreenHeaderComponent {
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  protected readonly lang = inject(LanguageService);

  @Input() title = '';
  @Input() showBrand = false;
  @Input() backHref?: string;
  @Input() showBack = false;
  @Input() variant: ScreenHeaderVariant = 'default';
  @Input() rightIcon?: string;
  @Input() rightAriaLabel = '';
  @Input() showPokeball = false;
  @Input() showThemeToggle = true;
  @Input() showLanguageToggle = true;

  @Output() backClick = new EventEmitter<void>();
  @Output() rightClick = new EventEmitter<void>();
  @Output() pokeballClick = new EventEmitter<void>();

  @Input() pokeballHref = '/';

  constructor() {
    addIcons({ chevronBackOutline, shareOutline });
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
    if (this.isOverlay) {
      return (
        !!this.rightIcon ||
        this.showThemeToggle ||
        this.showLanguageToggle
      );
    }

    return (
      !!this.rightIcon ||
      (this.showPokeball && !this.isBrand) ||
      (this.showThemeToggle && !this.isBrand) ||
      (this.showLanguageToggle && !this.isBrand)
    );
  }

  async setLocale(locale: 'en' | 'id'): Promise<void> {
    await this.lang.setLocale(locale);
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
