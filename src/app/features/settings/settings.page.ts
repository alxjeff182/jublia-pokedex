import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
import { ThemeService } from '../../core/services/theme.service';
import { ScreenHeaderComponent } from '../../shared/components/screen-header/screen-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    ScreenHeaderComponent,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonNote,
    IonButton,
    IonToggle,
  ],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly router = inject(Router);
  private readonly favorites = inject(FavoritesService);
  private readonly haptics = inject(HapticsService);
  private readonly toastController = inject(ToastController);

  protected readonly theme = inject(ThemeService);
  private readonly alertController = inject(AlertController);

  readonly clearing = signal(false);
  readonly appVersion = environment.appVersion;
  readonly hapticsEnabled = computed(() => this.haptics.isEnabled());

  openCompare(): void {
    void this.router.navigate(['/tabs/compare']);
  }

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
      header: 'Clear favorites?',
      message: 'This will remove all Pokémon from your favorites list.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear all',
          role: 'destructive',
          handler: () => {
            void this.performClear();
          },
        },
      ],
    });
    await alert.present();
  }

  private async performClear(): Promise<void> {
    this.clearing.set(true);
    await this.favorites.clearAll();
    this.clearing.set(false);
    const toast = await this.toastController.create({
      message: 'All favorites cleared',
      duration: 2500,
      color: 'success',
      position: 'bottom',
    });
    await toast.present();
  }
}
