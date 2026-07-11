import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular/standalone';
import { SettingsPage } from './settings.page';
import { FavoritesService } from '../../core/services/favorites.service';
import { HapticsService } from '../../core/services/haptics.service';
import { ThemeService } from '../../core/services/theme.service';

describe('SettingsPage', () => {
  let fixture: ComponentFixture<SettingsPage>;
  let component: SettingsPage;
  let router: jasmine.SpyObj<Router>;
  let favorites: jasmine.SpyObj<FavoritesService>;
  let haptics: jasmine.SpyObj<HapticsService>;
  let theme: jasmine.SpyObj<ThemeService>;
  let alertController: jasmine.SpyObj<AlertController>;
  let toastController: jasmine.SpyObj<ToastController>;

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    favorites = jasmine.createSpyObj('FavoritesService', ['clearAll']);
    favorites.clearAll.and.resolveTo();
    haptics = jasmine.createSpyObj('HapticsService', ['isEnabled', 'setEnabled', 'selectionChanged']);
    haptics.isEnabled.and.returnValue(true);
    haptics.setEnabled.and.resolveTo();
    haptics.selectionChanged.and.resolveTo();
    theme = jasmine.createSpyObj('ThemeService', ['getPreference', 'setPreference']);
    Object.defineProperty(theme, 'isDark', { value: signal(false) });
    theme.getPreference.and.returnValue('light');
    theme.setPreference.and.resolveTo();
    alertController = jasmine.createSpyObj('AlertController', ['create']);
    toastController = jasmine.createSpyObj('ToastController', ['create']);

    alertController.create.and.callFake(async (options = {}) => {
      const buttons = Array.isArray(options.buttons) ? options.buttons : [];
      const destructive = buttons.find(
        (button) => typeof button !== 'string' && button.role === 'destructive',
      ) as { handler?: () => void } | undefined;
      destructive?.handler?.();
      return {
        present: jasmine.createSpy('present').and.resolveTo(),
      } as unknown as HTMLIonAlertElement;
    });

    toastController.create.and.resolveTo({
      present: jasmine.createSpy('present').and.resolveTo(),
    } as unknown as HTMLIonToastElement);

    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: FavoritesService, useValue: favorites },
        { provide: HapticsService, useValue: haptics },
        { provide: ThemeService, useValue: theme },
        { provide: AlertController, useValue: alertController },
        { provide: ToastController, useValue: toastController },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the page', () => {
    expect(component).toBeTruthy();
  });

  it('clears all favorites after confirmation', async () => {
    await component.clearFavorites();
    expect(favorites.clearAll).toHaveBeenCalled();
    expect(component.clearing()).toBeFalse();
  });

  it('updates haptics preference from toggle', async () => {
    await component.onHapticsToggle({ detail: { checked: false } } as CustomEvent);
    expect(haptics.setEnabled).toHaveBeenCalledWith(false);
  });

  it('plays selection haptic when enabling haptics', async () => {
    await component.onHapticsToggle({ detail: { checked: true } } as CustomEvent);
    expect(haptics.setEnabled).toHaveBeenCalledWith(true);
    expect(haptics.selectionChanged).toHaveBeenCalled();
  });

  it('updates theme preference from toggle', async () => {
    await component.onThemeToggle({ detail: { checked: true } } as CustomEvent);
    expect(theme.setPreference).toHaveBeenCalledWith('dark');
  });

  it('switches back to light from toggle', async () => {
    await component.onThemeToggle({ detail: { checked: false } } as CustomEvent);
    expect(theme.setPreference).toHaveBeenCalledWith('light');
  });
});
