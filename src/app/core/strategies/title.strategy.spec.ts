import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { SeoService } from '../services/seo.service';
import { AppTitleStrategy } from './title.strategy';

function snapshotFor(
  path: string,
  data: Record<string, string> = {},
  slug?: string,
): RouterStateSnapshot {
  const leaf = {
    firstChild: null,
    data,
    paramMap: { get: (key: string) => (key === 'slug' ? slug ?? null : null) },
    routeConfig: { path },
  };

  return {
    root: { firstChild: leaf },
  } as RouterStateSnapshot;
}

describe('AppTitleStrategy', () => {
  let strategy: AppTitleStrategy;
  let title: Title;
  let seo: jasmine.SpyObj<SeoService>;

  beforeEach(() => {
    seo = jasmine.createSpyObj('SeoService', [
      'updateTags',
      'updateCanonical',
      'setJsonLd',
      'buildUrl',
    ]);
    seo.buildUrl.and.callFake(
      (path: string) => `https://alxjeff182.github.io/jublia-pokedex${path}`,
    );

    TestBed.configureTestingModule({
      providers: [{ provide: SeoService, useValue: seo }],
    });
    strategy = TestBed.inject(AppTitleStrategy);
    title = TestBed.inject(Title);
  });

  it('prefixes route titles with the app name', () => {
    strategy.updateTitle(snapshotFor('home', { title: 'Home' }));
    expect(title.getTitle()).toBe('My Pokedex by Jublia AI — Home');
    expect(seo.setJsonLd).toHaveBeenCalledWith(null);
    expect(seo.updateTags).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'My Pokedex by Jublia AI — Home',
        url: 'https://alxjeff182.github.io/jublia-pokedex/',
      }),
    );
    expect(seo.updateCanonical).toHaveBeenCalledWith(
      'https://alxjeff182.github.io/jublia-pokedex/',
    );
  });

  it('formats pokemon detail titles', () => {
    strategy.updateTitle(snapshotFor('pokemon/:slug', {}, 'pikachu'));
    expect(title.getTitle()).toBe('My Pokedex by Jublia AI — Pikachu');
    expect(seo.updateTags).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'My Pokedex by Jublia AI — Pikachu',
        url: 'https://alxjeff182.github.io/jublia-pokedex/pokemon/pikachu',
      }),
    );
  });

  it('falls back to mapped tab titles', () => {
    strategy.updateTitle(snapshotFor('browse'));
    expect(title.getTitle()).toBe('My Pokedex by Jublia AI — Browse');
    expect(seo.updateCanonical).toHaveBeenCalledWith(
      'https://alxjeff182.github.io/jublia-pokedex/browse',
    );
  });

  it('uses generic pokemon title when slug is missing', () => {
    strategy.updateTitle(snapshotFor('pokemon/:slug'));
    expect(title.getTitle()).toBe('My Pokedex by Jublia AI — Pokémon');
    expect(seo.updateTags).toHaveBeenCalledWith(
      jasmine.objectContaining({
        description: jasmine.stringMatching(/Pokémon details/i),
      }),
    );
  });

  it('maps known tab paths to titles', () => {
    strategy.updateTitle(snapshotFor('settings'));
    expect(title.getTitle()).toBe('My Pokedex by Jublia AI — Settings');
    strategy.updateTitle(snapshotFor('favorites'));
    expect(title.getTitle()).toBe('My Pokedex by Jublia AI — Favorites');
    strategy.updateTitle(snapshotFor('splash'));
    expect(title.getTitle()).toBe('My Pokedex by Jublia AI — Loading');
    strategy.updateTitle(snapshotFor('compare'));
    expect(title.getTitle()).toBe('My Pokedex by Jublia AI — Compare');
  });
});
