import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  let service: LanguageService;
  let getPreference: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LanguageService);
    getPreference = spyOn(Preferences, 'get').and.resolveTo({ value: null });
    spyOn(Preferences, 'set').and.resolveTo();
  });

  it('defaults to English', () => {
    expect(service.getLocale()).toBe('en');
    expect(service.isEnglish()).toBeTrue();
    expect(service.isIndonesian()).toBeFalse();
  });

  it('translates keys in English', () => {
    expect(service.t('tabs.home')).toBe('Home');
  });

  it('switches to Indonesian', async () => {
    await service.setLocale('id');
    expect(service.getLocale()).toBe('id');
    expect(service.t('tabs.home')).toBe('Beranda');
    expect(service.isIndonesian()).toBeTrue();
  });

  it('toggles locale', async () => {
    await service.toggleLocale();
    expect(service.getLocale()).toBe('id');
    await service.toggleLocale();
    expect(service.getLocale()).toBe('en');
  });

  it('interpolates params', () => {
    expect(service.t('home.resultsFound', { count: '5' })).toBe('5 Pokémon found');
  });

  it('returns key when translation is missing', () => {
    expect(service.t('missing.key')).toBe('missing.key');
  });

  it('translates pokemon types', async () => {
    await service.setLocale('id');
    expect(service.translateType('fire')).toBe('Api');
  });

  it('translates stats and short stats', async () => {
    expect(service.translateStat('attack')).toBe('Attack');
    expect(service.translateStatShort('attack')).toBe('ATK');
    await service.setLocale('id');
    expect(service.translateStatShort('speed')).toBe('CEP');
  });

  it('translates learn methods', async () => {
    await service.setLocale('id');
    expect(service.translateLearnMethod('level-up')).toBe('Naik Level');
  });

  it('falls back for unknown type and stat names', () => {
    expect(service.translateType('unknown-type')).toBe('Unknown Type');
    expect(service.translateStat('custom-stat')).toBe('Custom Stat');
    expect(service.translateLearnMethod('other')).toBe('Other');
  });

  it('loads saved locale on init', async () => {
    getPreference.and.returnValue(Promise.resolve({ value: 'id' }));
    const localService = new LanguageService();
    await localService.init();
    expect(localService.getLocale()).toBe('id');
  });

  it('ignores invalid saved locale', async () => {
    await service.setLocale('en');
    getPreference.and.resolveTo({ value: 'fr' });
    await service.init();
    expect(service.getLocale()).toBe('en');
  });

  it('resolves page titles', async () => {
    await service.setLocale('id');
    expect(service.translateTitle('settings')).toBe('Pengaturan');
    expect(service.translateTitle('pokemon/:slug', 'squirtle')).toBe('Squirtle');
    expect(service.translateTitle('pokemon/:slug')).toBe('Pokémon');
    expect(service.translateTitle('unknown')).toBeUndefined();
  });

  it('resolves page descriptions', async () => {
    expect(service.translateDescription('browse')).toContain('type');
    await service.setLocale('id');
    expect(service.translateDescription('settings')).toContain('My Pokedex by Jublia AI');
    expect(service.translateDescription('pokemon/:slug')).toContain('Pokémon');
    expect(service.translateDescription('unknown')).toContain('My Pokedex by Jublia AI');
  });
});
