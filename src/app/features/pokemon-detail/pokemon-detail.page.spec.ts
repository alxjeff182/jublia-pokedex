import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastController } from '@ionic/angular/standalone';
import { PokemonDetailPage } from './pokemon-detail.page';
import { PokemonService } from '../../core/services/pokemon.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { HapticsService } from '../../core/services/haptics.service';
import { PokemonDetail } from '../../core/models/pokemon.model';

describe('PokemonDetailPage', () => {
  let fixture: ComponentFixture<PokemonDetailPage>;
  let component: PokemonDetailPage;
  let pokemonService: jasmine.SpyObj<PokemonService>;
  let favorites: jasmine.SpyObj<FavoritesService>;
  let haptics: jasmine.SpyObj<HapticsService>;
  let router: jasmine.SpyObj<Router>;
  let paramMap$: { subscribe: (fn: (v: { get: (k: string) => string | null }) => void) => void };

  const mockDetail: PokemonDetail = {
    id: 25,
    name: 'pikachu',
    height: 4,
    weight: 60,
    sprites: { front_default: 'pikachu.png' },
    types: [{ slot: 1, type: { name: 'electric', url: '' } }],
    stats: [{ base_stat: 55, effort: 0, stat: { name: 'speed', url: '' } }],
    abilities: [],
    moves: [],
  };

  beforeEach(async () => {
    paramMap$ = {
      subscribe: (fn) => {
        fn(convertToParamMap({ id: '25' }));
        return { unsubscribe: () => undefined };
      },
    };

    pokemonService = jasmine.createSpyObj('PokemonService', [
      'getPokemonDetail',
      'getEvolutionChain',
      'getFlavorText',
    ]);
    pokemonService.getPokemonDetail.and.returnValue(of(mockDetail));
    pokemonService.getEvolutionChain.and.returnValue(of([]));
    pokemonService.getFlavorText.and.returnValue(of('A mouse Pokémon.'));

    favorites = jasmine.createSpyObj('FavoritesService', ['isFavorite', 'toggleFavorite']);
    favorites.isFavorite.and.returnValue(false);
    favorites.toggleFavorite.and.resolveTo();

    haptics = jasmine.createSpyObj('HapticsService', ['lightImpact']);
    haptics.lightImpact.and.resolveTo();

    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

    await TestBed.configureTestingModule({
      imports: [PokemonDetailPage],
      providers: [
        { provide: PokemonService, useValue: pokemonService },
        { provide: FavoritesService, useValue: favorites },
        { provide: HapticsService, useValue: haptics },
        { provide: Router, useValue: router },
        {
          provide: ToastController,
          useValue: {
            create: jasmine
              .createSpy('create')
              .and.resolveTo({ present: jasmine.createSpy('present').and.resolveTo() }),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$,
            snapshot: { paramMap: convertToParamMap({ id: '25' }) },
          },
        },
        { provide: Location, useValue: { back: jasmine.createSpy('back') } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates and loads pokemon detail', () => {
    expect(component).toBeTruthy();
    expect(component.pokemon()?.name).toBe('pikachu');
    expect(component.displayName).toBe('Pikachu');
    expect(component.displayId).toBe('#025');
  });

  it('toggles abilities panel', () => {
    expect(component.abilitiesOpen()).toBeFalse();
    component.toggleAbilities();
    expect(component.abilitiesOpen()).toBeTrue();
  });

  it('filters moves by search and learn method', () => {
    component.pokemon.set({
      ...mockDetail,
      moves: [
        {
          move: { name: 'thunderbolt', url: '' },
          version_group_details: [
            {
              level_learned_at: 26,
              move_learn_method: { name: 'level-up', url: '' },
              version_group: { name: 'red-blue', url: '' },
            },
          ],
        },
        {
          move: { name: 'agility', url: '' },
          version_group_details: [
            {
              level_learned_at: 0,
              move_learn_method: { name: 'machine', url: '' },
              version_group: { name: 'red-blue', url: '' },
            },
          ],
        },
      ],
    });

    component.setMoveFilter('machine');
    expect(component.filteredMoves().map((m) => m.name)).toEqual(['agility']);

    component.setMoveFilter('all');
    component.onMoveSearch({ detail: { value: 'thunder' } } as CustomEvent);
    expect(component.filteredMoves().map((m) => m.name)).toEqual(['thunderbolt']);
  });

  it('toggles favorite with haptics', async () => {
    await component.toggleFavorite();
    expect(favorites.toggleFavorite).toHaveBeenCalledWith(25);
    expect(haptics.lightImpact).toHaveBeenCalled();
  });

  it('retries loading on error', () => {
    pokemonService.getPokemonDetail.calls.reset();
    component.retry();
    expect(pokemonService.getPokemonDetail).toHaveBeenCalledWith(25);
  });

  it('sets error when load fails', () => {
    pokemonService.getPokemonDetail.and.returnValue(throwError(() => new Error('fail')));
    component.retry();
    expect(component.error()).toBeTrue();
    expect(component.loading()).toBeFalse();
  });

  it('reports favorite state and radar stats', () => {
    expect(component.isFavorite()).toBeFalse();
    favorites.isFavorite.and.returnValue(true);
    expect(component.isFavorite()).toBeTrue();
    expect(component.radarStats(mockDetail)).toEqual([
      { name: 'speed', value: 55 },
    ]);
  });

  it('navigates back or home from goBack', () => {
    const location = TestBed.inject(Location);
    Object.defineProperty(window.history, 'length', { configurable: true, value: 2 });
    component.goBack();
    expect(location.back).toHaveBeenCalled();

    Object.defineProperty(window.history, 'length', { configurable: true, value: 1 });
    component.goBack();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/tabs/home');
  });

  it('manages moves modal state', () => {
    component.openMovesModal();
    expect(component.movesModalOpen()).toBeTrue();
    component.setMoveFilter('egg');
    expect(component.moveFilter()).toBe('egg');
    component.toggleMoveDetail('thunderbolt');
    expect(component.selectedMove()).toBe('thunderbolt');
    component.closeMovesModal();
    expect(component.movesModalOpen()).toBeFalse();
  });

  it('formats move learn summary with level', () => {
    const summary = component.moveLearnSummary({
      name: 'thunderbolt',
      label: 'Thunderbolt',
      learnMethods: ['level-up'],
      primaryMethod: 'level-up',
      minLevel: 26,
    });
    expect(summary).toBe('Level Up · Lv. 26');
  });

  it('formats move learn summary without level', () => {
    const summary = component.moveLearnSummary({
      name: 'agility',
      label: 'Agility',
      learnMethods: ['machine'],
      primaryMethod: 'machine',
      minLevel: null,
    });
    expect(summary).toBe('TM / HM');
  });

  it('uses default header color when pokemon has no types', () => {
    component.pokemon.set({ ...mockDetail, types: [] });
    expect(component.headerColor).toBe('var(--jublia-color-primary)');
  });

  it('falls back to header color for evolution nodes without type', () => {
    component.pokemon.set(mockDetail);
    expect(component.evolutionColor({ id: 1, name: 'bulbasaur', sprite: null, children: [] })).toBe(
      component.headerColor,
    );
  });

  it('shares pokemon with Web Share API when available', async () => {
    component.pokemon.set(mockDetail);
    const share = jasmine.createSpy('share').and.resolveTo();
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share,
    });

    await component.sharePokemon();
    expect(share).toHaveBeenCalled();
  });

  it('collapses expanded move details when toggled again', () => {
    component.toggleMoveDetail('thunderbolt');
    expect(component.selectedMove()).toBe('thunderbolt');
    component.toggleMoveDetail('thunderbolt');
    expect(component.selectedMove()).toBeNull();
  });

  it('returns empty display values before pokemon loads', () => {
    component.pokemon.set(null);
    expect(component.displayName).toBe('');
    expect(component.displayId).toBe('');
    expect(component.sprite).toBeNull();
  });

  it('opens another pokemon from evolution chain', () => {
    component.openPokemon(1);
    expect(router.navigate).toHaveBeenCalledWith(['/tabs/pokemon', 1]);
  });

  it('formats ability and evolution colors', () => {
    expect(component.formatAbilityName('overgrow')).toBe('Overgrow');
    expect(component.evolutionColor({ id: 1, name: 'bulbasaur', sprite: null, primaryType: 'grass', children: [] })).toContain('#');
  });

  it('dismisses error state', () => {
    component.error.set(true);
    component.dismissError();
    expect(component.error()).toBeFalse();
  });

  it('shares pokemon via clipboard when Web Share is unavailable', async () => {
    component.pokemon.set(mockDetail);
    const originalShare = navigator.share;
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: undefined,
    });
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await component.sharePokemon();
    expect(writeText).toHaveBeenCalled();

    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: originalShare,
    });
  });
});
