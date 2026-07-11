import { TestBed } from '@angular/core/testing';
import { appInitializer } from './app.initializer';
import { FavoritesService } from '../services/favorites.service';
import { HapticsService } from '../services/haptics.service';
import { LanguageService } from '../services/language.service';
import { PlatformService } from '../services/platform.service';
import { ThemeService } from '../services/theme.service';

describe('appInitializer', () => {
  it('initializes favorites, haptics, language, theme, and platform services', async () => {
    const favorites = jasmine.createSpyObj('FavoritesService', ['init']);
    favorites.init.and.resolveTo();
    const haptics = jasmine.createSpyObj('HapticsService', ['init']);
    haptics.init.and.resolveTo();
    const language = jasmine.createSpyObj('LanguageService', ['init']);
    language.init.and.resolveTo();
    const theme = jasmine.createSpyObj('ThemeService', ['init']);
    theme.init.and.resolveTo();
    const platform = jasmine.createSpyObj('PlatformService', ['initializeNative']);
    platform.initializeNative.and.resolveTo();

    TestBed.configureTestingModule({
      providers: [
        { provide: FavoritesService, useValue: favorites },
        { provide: HapticsService, useValue: haptics },
        { provide: LanguageService, useValue: language },
        { provide: ThemeService, useValue: theme },
        { provide: PlatformService, useValue: platform },
      ],
    });

    await TestBed.runInInjectionContext(appInitializer);
    expect(favorites.init).toHaveBeenCalled();
    expect(haptics.init).toHaveBeenCalled();
    expect(language.init).toHaveBeenCalled();
    expect(theme.init).toHaveBeenCalled();
    expect(platform.initializeNative).toHaveBeenCalled();
  });
});
