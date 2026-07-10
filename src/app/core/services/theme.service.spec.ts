import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import { ThemeService } from './theme.service';

const STORAGE_KEY = 'CapacitorStorage.jublia_dex_theme';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    document.documentElement.className = '';
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to light preference', async () => {
    await service.init();
    expect(service.getPreference()).toBe('light');
  });

  it('applies dark palette when preference is dark', async () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    await service.init();
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBeTrue();
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('persists theme changes', async () => {
    await service.init();
    await service.setPreference('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
    expect(document.documentElement.classList.contains('ion-palette-light')).toBeTrue();
  });

  it('reports dark active state from preference', async () => {
    await service.setPreference('dark');
    expect(service.isDarkActive()).toBeTrue();
    await service.setPreference('light');
    expect(service.isDarkActive()).toBeFalse();
  });

  it('applies light palette when preference is light', async () => {
    localStorage.setItem(STORAGE_KEY, 'light');
    await service.init();
    expect(document.documentElement.classList.contains('ion-palette-light')).toBeTrue();
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('follows system dark preference when set to system', async () => {
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    } as unknown as MediaQueryList);
    localStorage.setItem(STORAGE_KEY, 'system');
    await service.init();
    expect(service.isDarkActive()).toBeTrue();
    expect(document.documentElement.classList.contains('ion-palette-dark')).toBeTrue();
  });

  it('ignores invalid stored preference values', async () => {
    localStorage.setItem(STORAGE_KEY, 'invalid');
    await service.init();
    expect(service.getPreference()).toBe('light');
  });

  it('reacts to system preference changes', async () => {
    let changeHandler: (event: MediaQueryListEvent) => void = () => undefined;
    spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      addEventListener: (_event: string, handler: (event: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      },
      removeEventListener: jasmine.createSpy('removeEventListener'),
    } as unknown as MediaQueryList);

    await service.setPreference('system');
    changeHandler({} as MediaQueryListEvent);
    expect(document.documentElement.classList.contains('ion-palette-light')).toBeTrue();
  });

  it('keeps manual light theme when system preference changes', async () => {
    let changeHandler: (event: MediaQueryListEvent) => void = () => undefined;
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
      addEventListener: (_event: string, handler: (event: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      },
      removeEventListener: jasmine.createSpy('removeEventListener'),
    } as unknown as MediaQueryList);

    await service.setPreference('light');
    changeHandler({} as MediaQueryListEvent);
    expect(document.documentElement.classList.contains('ion-palette-light')).toBeTrue();
  });

  it('reports system light preference from matchMedia', async () => {
    spyOn(window, 'matchMedia').and.returnValue({
      matches: false,
      addEventListener: jasmine.createSpy('addEventListener'),
      removeEventListener: jasmine.createSpy('removeEventListener'),
    } as unknown as MediaQueryList);
    await service.setPreference('system');
    expect(service.isDarkActive()).toBeFalse();
  });

  it('toggles between light and dark', async () => {
    await service.setPreference('light');
    await service.toggleDarkMode();
    expect(service.getPreference()).toBe('dark');
    await service.toggleDarkMode();
    expect(service.getPreference()).toBe('light');
  });

  it('exposes isDark signal from preference', async () => {
    await service.setPreference('dark');
    expect(service.isDark()).toBeTrue();
    await service.setPreference('light');
    expect(service.isDark()).toBeFalse();
  });

  it('ignores status bar failures on native platforms', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    const originalSetStyle = StatusBar.setStyle;
    StatusBar.setStyle = () => Promise.reject(new Error('unsupported'));
    await expectAsync(service.setPreference('light')).toBeResolved();
    StatusBar.setStyle = originalSetStyle;
  });

  it('ignores status bar background failures on native platforms', async () => {
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
    const originalSetStyle = StatusBar.setStyle;
    const originalSetBackground = StatusBar.setBackgroundColor;
    StatusBar.setStyle = () => Promise.resolve();
    StatusBar.setBackgroundColor = () => Promise.reject(new Error('unsupported'));
    await expectAsync(service.setPreference('dark')).toBeResolved();
    StatusBar.setStyle = originalSetStyle;
    StatusBar.setBackgroundColor = originalSetBackground;
  });
});
