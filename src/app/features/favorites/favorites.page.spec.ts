import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { FavoritesPage } from './favorites.page';
import { FavoritesService } from '../../core/services/favorites.service';
import { HapticsService } from '../../core/services/haptics.service';
import { PokemonService } from '../../core/services/pokemon.service';

describe('FavoritesPage', () => {
  let fixture: ComponentFixture<FavoritesPage>;
  let component: FavoritesPage;
  let favorites: jasmine.SpyObj<FavoritesService>;
  let pokemonService: jasmine.SpyObj<PokemonService>;
  let haptics: jasmine.SpyObj<HapticsService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    favorites = jasmine.createSpyObj('FavoritesService', [
      'getFavoriteIds',
      'isFavorite',
    ]);
    pokemonService = jasmine.createSpyObj('PokemonService', ['getCardsByIds']);
    haptics = jasmine.createSpyObj('HapticsService', ['lightImpact']);
    haptics.lightImpact.and.resolveTo();
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FavoritesPage],
      providers: [
        { provide: FavoritesService, useValue: favorites },
        { provide: PokemonService, useValue: pokemonService },
        { provide: HapticsService, useValue: haptics },
        { provide: Router, useValue: router },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesPage);
    component = fixture.componentInstance;
  });

  it('shows empty state when no favorites', () => {
    favorites.getFavoriteIds.and.returnValue([]);
    component.ionViewWillEnter();
    fixture.detectChanges();

    expect(component.pokemon()).toEqual([]);
    expect(component.loading()).toBeFalse();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('No favorites yet');
  });

  it('loads favorite cards when ids exist', () => {
    favorites.getFavoriteIds.and.returnValue([25]);
    pokemonService.getCardsByIds.and.returnValue(
      of([{ id: 25, name: 'pikachu', sprite: null, types: ['electric'] }]),
    );

    component.ionViewWillEnter();
    fixture.detectChanges();

    expect(pokemonService.getCardsByIds).toHaveBeenCalledWith([25]);
    expect(component.pokemon().length).toBe(1);
    expect(component.favoriteCount()).toBe(1);
  });

  it('retries loading after error', () => {
    favorites.getFavoriteIds.and.returnValue([25]);
    pokemonService.getCardsByIds.and.returnValue(
      throwError(() => new Error('network')),
    );
    component.ionViewWillEnter();
    expect(component.error()).toBeTrue();

    pokemonService.getCardsByIds.and.returnValue(
      of([{ id: 25, name: 'pikachu', sprite: null, types: ['electric'] }]),
    );
    component.retry();
    expect(component.error()).toBeFalse();
    expect(component.pokemon().length).toBe(1);
  });

  it('removes unfavorited pokemon from the list', () => {
    favorites.getFavoriteIds.and.returnValue([25]);
    favorites.isFavorite.and.returnValue(false);
    component.pokemon.set([
      { id: 25, name: 'pikachu', sprite: null, types: ['electric'] },
    ]);

    component.onFavoriteToggled(25);
    expect(component.removingIds().has(25)).toBeTrue();
  });

  it('ignores favorite toggle when pokemon remains favorited', () => {
    favorites.isFavorite.and.returnValue(true);
    component.onFavoriteToggled(25);
    expect(component.removingIds().size).toBe(0);
  });

  it('navigates home from empty state action', () => {
    component.goHome();
    expect(router.navigate).toHaveBeenCalledWith(['/tabs/home']);
  });

  it('dismisses error and refreshes on pull', async () => {
    favorites.getFavoriteIds.and.returnValue([]);
    component.error.set(true);
    component.dismissError();
    expect(component.error()).toBeFalse();

    const complete = jasmine.createSpy('complete');
    await component.onRefresh({ target: { complete } } as never);
    expect(complete).toHaveBeenCalled();
    expect(haptics.lightImpact).toHaveBeenCalled();
  });
});
