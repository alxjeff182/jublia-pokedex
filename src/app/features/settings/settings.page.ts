import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AlertController,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonToggle,
  ToastController,
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';
import { FavoritesService } from '../../core/services/favorites.service';
import { HapticsService } from '../../core/services/haptics.service';
import { LanguageService } from '../../core/services/language.service';
import { ThemeService } from '../../core/services/theme.service';
import { ScreenHeaderComponent } from '../../shared/components/screen-header/screen-header.component';
import { ComparePromoComponent } from '../../shared/components/compare-promo/compare-promo.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ScreenHeaderComponent,
    ComparePromoComponent,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonButton,
    IonToggle,
    TranslatePipe,
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly favorites = inject(FavoritesService);
  private readonly haptics = inject(HapticsService);
  private readonly toastController = inject(ToastController);

  protected readonly theme = inject(ThemeService);
  protected readonly lang = inject(LanguageService);
  private readonly alertController = inject(AlertController);

  readonly clearing = signal(false);
  readonly appVersion = environment.appVersion;
  readonly hapticsEnabled = computed(() => this.haptics.isEnabled());

  async onThemeToggle(event: CustomEvent): Promise<void> {
    const checked = (event.detail as { checked: boolean }).checked;
    await this.theme.setPreference(checked ? 'dark' : 'light');
  }

  async onHapticsToggle(event: CustomEvent): Promise<void> {
    const enabled = (event.detail as { checked: boolean }).checked;
    await this.haptics.setEnabled(enabled);
    if (enabled) {
      await this.haptics.selectionChanged();
    }
  }

  async clearFavorites(): Promise<void> {
    const alert = await this.alertController.create({
      header: this.lang.t('settings.clearAlertHeader'),
      message: this.lang.t('settings.clearAlertMessage'),
      buttons: [
        { text: this.lang.t('common.cancel'), role: 'cancel' },
        {
          text: this.lang.t('settings.clearAll'),
          role: 'destructive',
          handler: () => {
            void this.performClear();
          },
        },
      ],
    });
    await alert.present();
  }

  async setLocale(locale: 'en' | 'id'): Promise<void> {
    await this.lang.setLocale(locale);
  }

  private async performClear(): Promise<void> {
    this.clearing.set(true);
    await this.favorites.clearAll();
    this.clearing.set(false);
    const toast = await this.toastController.create({
      message: this.lang.t('settings.clearedToast'),
      duration: 2500,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }
}
