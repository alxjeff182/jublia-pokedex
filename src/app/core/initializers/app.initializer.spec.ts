import { TestBed } from '@angular/core/testing';
import { appInitializer } from './app.initializer';
import { FavoritesService } from '../services/favorites.service';
import { HapticsService } from '../services/haptics.service';
import { PlatformService } from '../services/platform.service';

describe('appInitializer', () => {
  it('initializes favorites, haptics, and platform services', async () => {
    const favorites = jasmine.createSpyObj('FavoritesService', ['init']);
    favorites.init.and.resolveTo();
    const haptics = jasmine.createSpyObj('HapticsService', ['init']);
    haptics.init.and.resolveTo();
    const platform = jasmine.createSpyObj('PlatformService', ['initializeNative']);
    platform.initializeNative.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        { provide: FavoritesService, useValue: favorites },
        { provide: HapticsService, useValue: haptics },
        { provide: PlatformService, useValue: platform },
      ],
    });

    await TestBed.runInInjectionContext(appInitializer);
    expect(favorites.init).toHaveBeenCalled();
    expect(haptics.init).toHaveBeenCalled();
    expect(platform.initializeNative).toHaveBeenCalled();
  });
});
