import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import {
  IonBadge,
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  grid,
  heart,
  home,
  settings,
} from 'ionicons/icons';
import { FavoritesService } from '../../core/services/favorites.service';
import { HapticsService } from '../../core/services/haptics.service';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge],
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage {
  private readonly favorites = inject(FavoritesService);
  private readonly haptics = inject(HapticsService);

  readonly favoriteCount = computed(() => this.favorites.getFavoriteIds().length);

  constructor() {
    addIcons({ home, grid, heart, settings });
  }

  onTabChange(): void {
    void this.haptics.selectionChanged();
  }
}
