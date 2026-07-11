import { Injectable, computed, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { formatPokemonName } from '../models/pokemon.model';
import { AppLocale, TranslationKey } from '../i18n/translation.types';
import { en } from '../i18n/translations/en';
import { id } from '../i18n/translations/id';

const LOCALE_KEY = 'jublia_dex_locale';

const TRANSLATIONS = { en, id } as const;

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly localeSignal = signal<AppLocale>('en');
  readonly locale = this.localeSignal.asReadonly();
  readonly isEnglish = computed(() => this.localeSignal() === 'en');
  readonly isIndonesian = computed(() => this.localeSignal() === 'id');

  async init(): Promise<void> {
    const { value } = await Preferences.get({ key: LOCALE_KEY });
    if (value === 'en' || value === 'id') {
      this.localeSignal.set(value);
    }
    this.applyDocumentLang();
  }

  getLocale(): AppLocale {
    return this.localeSignal();
  }

  async setLocale(locale: AppLocale): Promise<void> {
    this.localeSignal.set(locale);
    await Preferences.set({ key: LOCALE_KEY, value: locale });
    this.applyDocumentLang();
  }

  async toggleLocale(): Promise<void> {
    await this.setLocale(this.localeSignal() === 'en' ? 'id' : 'en');
  }

  t(key: TranslationKey | string, params?: Record<string, string | number>): string {
    const [section, field] = key.split('.');
    const dictionary = TRANSLATIONS[this.localeSignal()];
    const sectionData = dictionary[section as keyof typeof dictionary] as
      | Record<string, string>
      | undefined;
    let value = sectionData?.[field ?? ''] ?? key;

    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.split(`{{${paramKey}}}`).join(String(paramValue));
      }
    }

    return value;
  }

  translateType(type: string): string {
    const key = `types.${type}` as TranslationKey;
    const translated = this.t(key);
    return translated === key ? formatPokemonName(type) : translated;
  }

  translateStat(stat: string): string {
    const key = `stats.${stat}` as TranslationKey;
    const translated = this.t(key);
    return translated === key ? formatPokemonName(stat) : translated;
  }

  translateStatShort(stat: string): string {
    const key = `statShort.${stat}` as TranslationKey;
    const translated = this.t(key);
    return translated === key ? formatPokemonName(stat) : translated;
  }

  translateLearnMethod(method: string): string {
    const key = `learnMethods.${method}` as TranslationKey;
    const translated = this.t(key);
    return translated === key ? formatPokemonName(method) : translated;
  }

  translateTitle(path: string, pokemonSlug?: string): string | undefined {
    const titles: Record<string, string> = {
      '': this.t('titles.home'),
      home: this.t('titles.home'),
      browse: this.t('titles.browse'),
      favorites: this.t('titles.favorites'),
      settings: this.t('titles.settings'),
      compare: this.t('titles.compare'),
      splash: this.t('titles.splash'),
    };

    if (path === 'pokemon/:slug' || path.includes('pokemon')) {
      return pokemonSlug
        ? formatPokemonName(pokemonSlug)
        : this.t('titles.pokemon');
    }

    return titles[path];
  }

  translateDescription(path: string, pokemonSlug?: string): string {
    const descriptions: Record<string, string> = {
      '': this.t('seo.home'),
      home: this.t('seo.home'),
      browse: this.t('seo.browse'),
      favorites: this.t('seo.favorites'),
      settings: this.t('seo.settings'),
      compare: this.t('seo.compare'),
      splash: this.t('seo.splash'),
    };

    if (path === 'pokemon/:slug' || path.includes('pokemon')) {
      return this.t('seo.pokemonFallback');
    }

    return descriptions[path] ?? this.t('seo.home');
  }

  private applyDocumentLang(): void {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = this.localeSignal();
    }
  }
}
