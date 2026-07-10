import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PokemonListPage } from './pokemon-list.page';
import { PokemonService } from '../../core/services/pokemon.service';
import { HapticsService } from '../../core/services/haptics.service';

describe('PokemonListPage', () => {
  let fixture: ComponentFixture<PokemonListPage>;
  let component: PokemonListPage;
  let pokemonService: jasmine.SpyObj<PokemonService>;

  beforeEach(async () => {
    pokemonService = jasmine.createSpyObj('PokemonService', ['getPokemonPage']);
    pokemonService.getPokemonPage.and.returnValue(
      of({ items: [], hasMore: false, total: 0 }),
    );

    await TestBed.configureTestingModule({
      imports: [PokemonListPage],
      providers: [
        { provide: PokemonService, useValue: pokemonService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => null } } },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PokemonListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the page', () => {
    expect(component).toBeTruthy();
  });

  it('toggles type filters', () => {
    component.toggleType('fire');
    expect(component.selectedTypes()).toEqual(['fire']);
    component.toggleType('fire');
    expect(component.selectedTypes()).toEqual([]);
  });

  it('clears search query and reloads', () => {
    component.searchQuery.set('pika');
    component.onSearchClear();
    expect(component.searchQuery()).toBe('');
    expect(pokemonService.getPokemonPage).toHaveBeenCalled();
  });

  it('reports active filters when search or types are set', () => {
    expect(component.hasActiveFilters()).toBeFalse();
    component.searchQuery.set('pika');
    expect(component.hasActiveFilters()).toBeTrue();
    component.clearAllFilters();
    expect(component.searchQuery()).toBe('');
    expect(component.selectedTypes()).toEqual([]);
  });

  it('formats type labels and chip styles', () => {
    expect(component.typeLabel('fire')).toBe('Fire');
    component.toggleType('fire');
    expect(component.isTypeSelected('fire')).toBeTrue();
    expect(component.filterChipBackground('fire')).toContain('#');
    expect(component.filterChipTextColor('fire')).toContain('#');
  });

  it('applies suggested type filter', () => {
    component.applySuggestedType('water');
    expect(component.selectedTypes()).toEqual(['water']);
    expect(component.searchQuery()).toBe('');
    expect(pokemonService.getPokemonPage).toHaveBeenCalled();
  });

  it('navigates to browse screen', () => {
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.openBrowse();
    expect(router.navigate).toHaveBeenCalledWith(['/tabs/browse']);
  });

  it('applies type from route query params', () => {
    const route = TestBed.inject(ActivatedRoute);
    (route.snapshot.queryParamMap as { get: (key: string) => string }).get = () => 'fire';
    component.ionViewWillEnter();
    expect(component.selectedTypes()).toEqual(['fire']);
  });

  it('computes results label with active filters', () => {
    component.pokemon.set([
      { id: 25, name: 'pikachu', sprite: null, types: ['electric'] },
    ]);
    component.hasMore.set(false);
    component.searchQuery.set('pika');
    expect(component.resultsLabel()).toBe('1 Pokémon found');
    expect(component.activeFilterCount()).toBe(1);
  });

  it('returns empty results label when list is empty', () => {
    component.pokemon.set([]);
    expect(component.resultsLabel()).toBe('');
  });

  it('ignores invalid route type filters', () => {
    const route = TestBed.inject(ActivatedRoute);
    (route.snapshot.queryParamMap as { get: (key: string) => string }).get = () => 'not-a-type';
    component.ionViewWillEnter();
    expect(component.selectedTypes()).toEqual([]);
  });

  it('skips duplicate clear-all requests while clearing', () => {
    component.clearingFilters.set(true);
    component.selectedTypes.set(['fire']);
    component.clearAllFilters();
    expect(component.selectedTypes()).toEqual(['fire']);
  });

  it('shows plus suffix when more results are available', () => {
    component.pokemon.set([
      { id: 25, name: 'pikachu', sprite: null, types: ['electric'] },
    ]);
    component.hasMore.set(true);
    expect(component.resultsLabel()).toBe('1+ Pokémon');
  });

  it('styles unselected filter chips with muted colors', () => {
    expect(component.filterChipBackground('water')).toBeTruthy();
    expect(component.filterChipTextColor('water')).toBeTruthy();
  });

  it('styles filter chips for selected and unselected types', () => {
    expect(component.filterChipBorder('fire')).toBe('none');
    component.toggleType('fire');
    expect(component.filterChipBorder('fire')).toContain('1px solid');
    component.removeType('fire');
    expect(component.selectedTypes()).toEqual([]);
  });

  it('suggests types that are not already selected', () => {
    component.selectedTypes.set(['fire', 'water', 'grass']);
    expect(component.suggestedTypes().length).toBeLessThanOrEqual(3);
    expect(component.suggestedTypes()).not.toContain('fire');
  });

  it('refreshes list data', async () => {
    const haptics = TestBed.inject(HapticsService);
    spyOn(haptics, 'lightImpact').and.resolveTo();
    pokemonService.getPokemonPage.and.returnValue(
      of({
        items: [{ id: 25, name: 'pikachu', sprite: null, types: ['electric'] }],
        hasMore: false,
        total: 1,
      }),
    );

    const complete = jasmine.createSpy('complete');
    await component.onRefresh({ target: { complete } } as never);
    expect(component.pokemon().length).toBe(1);
    expect(complete).toHaveBeenCalled();
  });

  it('retries after error', () => {
    component.error.set(true);
    component.dismissError();
    expect(component.error()).toBeFalse();
    component.retry();
    expect(pokemonService.getPokemonPage).toHaveBeenCalled();
  });

  it('loads more pokemon on infinite scroll', async () => {
    pokemonService.getPokemonPage.and.returnValues(
      of({
        items: [{ id: 1, name: 'bulbasaur', sprite: null, types: ['grass'] }],
        hasMore: true,
        total: 2,
      }),
      of({
        items: [{ id: 2, name: 'ivysaur', sprite: null, types: ['grass'] }],
        hasMore: false,
        total: 2,
      }),
    );
    component.hasMore.set(true);
    component.pokemon.set([{ id: 1, name: 'bulbasaur', sprite: null, types: ['grass'] }]);

    const complete = jasmine.createSpy('complete');
    component.onInfiniteScroll({ target: { complete } } as never);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(component.pokemon().length).toBe(2);
    expect(complete).toHaveBeenCalled();
  });

  it('reloads when search input changes', fakeAsync(() => {
    component.onSearchChange({ detail: { value: 'pika' } } as CustomEvent);
    tick(300);
    expect(component.searchQuery()).toBe('pika');
    expect(pokemonService.getPokemonPage).toHaveBeenCalled();
  }));
});
