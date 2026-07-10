import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { AppTitleStrategy } from './title.strategy';

function snapshotFor(
  path: string,
  data: Record<string, string> = {},
  id?: string,
): RouterStateSnapshot {
  const leaf = {
    firstChild: null,
    data,
    paramMap: { get: (key: string) => (key === 'id' ? id ?? null : null) },
    routeConfig: { path },
  };

  return {
    root: { firstChild: leaf },
  } as RouterStateSnapshot;
}

describe('AppTitleStrategy', () => {
  let strategy: AppTitleStrategy;
  let title: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    strategy = TestBed.inject(AppTitleStrategy);
    title = TestBed.inject(Title);
  });

  it('prefixes route titles with the app name', () => {
    strategy.updateTitle(snapshotFor('home', { title: 'Home' }));
    expect(title.getTitle()).toBe('JUBLIA Dex — Home');
  });

  it('formats pokemon detail titles', () => {
    strategy.updateTitle(snapshotFor('pokemon/:id', {}, '25'));
    expect(title.getTitle()).toBe('JUBLIA Dex — Pokémon #25');
  });

  it('falls back to mapped tab titles', () => {
    strategy.updateTitle(snapshotFor('browse'));
    expect(title.getTitle()).toBe('JUBLIA Dex — Browse');
  });

  it('uses generic pokemon title when id is missing', () => {
    strategy.updateTitle(snapshotFor('pokemon/:id'));
    expect(title.getTitle()).toBe('JUBLIA Dex — Pokémon');
  });

  it('maps known tab paths to titles', () => {
    strategy.updateTitle(snapshotFor('settings'));
    expect(title.getTitle()).toBe('JUBLIA Dex — Settings');
    strategy.updateTitle(snapshotFor('favorites'));
    expect(title.getTitle()).toBe('JUBLIA Dex — Favorites');
    strategy.updateTitle(snapshotFor('splash'));
    expect(title.getTitle()).toBe('JUBLIA Dex — Loading');
    strategy.updateTitle(snapshotFor('compare'));
    expect(title.getTitle()).toBe('JUBLIA Dex — Compare');
  });
});
