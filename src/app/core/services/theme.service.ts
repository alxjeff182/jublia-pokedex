import { Injectable, computed, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { StatusBar, Style } from '@capacitor/status-bar';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_KEY = 'jublia_dex_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly preference = signal<ThemePreference>('light');
  readonly isDark = computed(() => this.isDarkActive());
  private mediaQuery: MediaQueryList | null = null;
  private mediaListener: ((event: MediaQueryListEvent) => void) | null = null;

  async init(): Promise<void> {
    const { value } = await Preferences.get({ key: THEME_KEY });
    if (value === 'light' || value === 'dark' || value === 'system') {
      this.preference.set(value);
    }

    this.bindSystemPreference();
    this.applyTheme();
  }

  getPreference(): ThemePreference {
    return this.preference();
  }

  async setPreference(preference: ThemePreference): Promise<void> {
    this.preference.set(preference);
    await Preferences.set({ key: THEME_KEY, value: preference });
    this.applyTheme();
  }

  async toggleDarkMode(): Promise<void> {
    await this.setPreference(this.isDarkActive() ? 'light' : 'dark');
  }

  isDarkActive(): boolean {
    if (this.preference() === 'dark') {
      return true;
    }
    if (this.preference() === 'light') {
      return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private bindSystemPreference(): void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaListener = () => {
      if (this.preference() === 'system') {
        this.applyTheme();
      }
    };
    this.mediaQuery.addEventListener('change', this.mediaListener);
  }

  private applyTheme(): void {
    const isDark = this.isDarkActive();
    const root = document.documentElement;

    root.classList.remove('ion-palette-light', 'ion-palette-dark');
    root.classList.add(isDark ? 'ion-palette-dark' : 'ion-palette-light');
    root.style.colorScheme = isDark ? 'dark' : 'light';

    void this.syncStatusBar(isDark);
  }

  private async syncStatusBar(isDark: boolean): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
      await StatusBar.setBackgroundColor({
        color: isDark ? '#0f0f12' : '#f5f5f7',
      });
    } catch {
      // Status bar not available on this platform.
    }
  }
}
