import { inject } from '@angular/core';
import { FavoritesService } from '../services/favorites.service';
import { HapticsService } from '../services/haptics.service';
import { PlatformService } from '../services/platform.service';
import { ThemeService } from '../services/theme.service';

export function appInitializer(): Promise<void> {
  const favorites = inject(FavoritesService);
  const haptics = inject(HapticsService);
  const theme = inject(ThemeService);
  const platform = inject(PlatformService);

  return favorites
    .init()
    .then(() => haptics.init())
    .then(() => theme.init())
    .then(() => platform.initializeNative());
}
