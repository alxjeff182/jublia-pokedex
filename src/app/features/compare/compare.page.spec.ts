import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ComparePage } from './compare.page';
import { PokemonService } from '../../core/services/pokemon.service';
import { CompareSelectionService } from '../../core/services/compare-selection.service';
import { PokemonDetail } from '../../core/models/pokemon.model';

describe('ComparePage', () => {
  let fixture: ComponentFixture<ComparePage>;
  let component: ComparePage;
  let pokemonService: jasmine.SpyObj<PokemonService>;
  let compareSelection: CompareSelectionService;

  const mockDetail = (id: number, height: number, weight: number): PokemonDetail => ({
    id,
    name: id === 25 ? 'pikachu' : 'bulbasaur',
    height,
    weight,
    sprites: { front_default: `${id}.png` },
    types: [{ slot: 1, type: { name: 'electric', url: '' } }],
    stats: [{ base_stat: 55, effort: 0, stat: { name: 'speed', url: '' } }],
    abilities: [],
    moves: [],
  });

  beforeEach(async () => {
    pokemonService = jasmine.createSpyObj('PokemonService', [
      'searchPokemonByName',
      'getPokemonDetail',
      'getNameIndex',
    ]);
    pokemonService.searchPokemonByName.and.returnValue(
      of([{ id: 25, name: 'pikachu', sprite: null, types: ['electric'] }]),
    );
    pokemonService.getPokemonDetail.and.callFake((id: number) =>
      of(mockDetail(id, id === 25 ? 4 : 7, id === 25 ? 60 : 69)),
    );
    pokemonService.getNameIndex.and.returnValue(
      of([
        { id: 25, name: 'pikachu' },
        { id: 1, name: 'bulbasaur' },
        { id: 4, name: 'charmander' },
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [ComparePage],
      providers: [{ provide: PokemonService, useValue: pokemonService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ComparePage);
    component = fixture.componentInstance;
    compareSelection = TestBed.inject(CompareSelectionService);
    fixture.detectChanges();
  });

  it('creates the page', () => {
    expect(component).toBeTruthy();
  });

  it('searches pokemon by name', fakeAsync(() => {
    component.onSearch({ detail: { value: 'pika' } } as CustomEvent);
    tick(300);
    expect(pokemonService.searchPokemonByName).toHaveBeenCalledWith('pika');
    expect(component.searchResults().length).toBe(1);
  }));

  it('clears search results for blank query', fakeAsync(() => {
    component.onSearch({ detail: { value: '   ' } } as CustomEvent);
    tick(300);
    expect(component.searchResults()).toEqual([]);
  }));

  it('selects pokemon for comparison sides', () => {
    component.selectPokemon('left', 25);
    component.selectPokemon('right', 1);
    expect(component.leftPokemon()?.id).toBe(25);
    expect(component.rightPokemon()?.id).toBe(1);
    expect(component.searchResults()).toEqual([]);
  });

  it('consumes queued pokemon on enter', () => {
    compareSelection.queue('left', 25);
    compareSelection.queue('right', 1);
    component.ionViewWillEnter();
    expect(component.leftPokemon()?.id).toBe(25);
    expect(component.rightPokemon()?.id).toBe(1);
    expect(compareSelection.consume()).toBeNull();
  });

  it('stops loading and sets error when detail fetch fails', () => {
    pokemonService.getPokemonDetail.and.returnValue(
      throwError(() => new Error('fail')),
    );
    component.selectPokemon('left', 25);
    expect(component.loadingLeft()).toBeFalse();
    expect(component.errorLeft()).toBeTrue();
  });

  it('retries the last selected side after a failure', () => {
    pokemonService.getPokemonDetail.and.returnValue(
      throwError(() => new Error('fail')),
    );
    component.selectPokemon('right', 1);
    pokemonService.getPokemonDetail.and.callFake((id: number) =>
      of(mockDetail(id, 4, 60)),
    );
    component.retry('right');
    expect(component.rightPokemon()?.id).toBe(1);
    expect(component.errorRight()).toBeFalse();
  });

  it('determines stat winners and labels', () => {
    component.leftPokemon.set(mockDetail(25, 4, 60));
    component.rightPokemon.set({
      ...mockDetail(1, 4, 60),
      stats: [{ base_stat: 70, effort: 0, stat: { name: 'speed', url: '' } }],
    });
    expect(component.isStatWinner('right', 'speed')).toBeTrue();
    expect(component.winsLabel('right')).toContain('1');
    expect(component.overallWinnerSide()).toBe('right');
  });

  it('returns null sprite when pokemon is missing', () => {
    expect(component.getSprite(null)).toBeNull();
  });

  it('marks left side as weight winner', () => {
    component.leftPokemon.set(mockDetail(25, 4, 80));
    component.rightPokemon.set(mockDetail(1, 4, 60));
    expect(component.isWeightWinner('left')).toBeTrue();
  });

  it('determines height and weight winners', () => {
    component.leftPokemon.set(mockDetail(25, 4, 60));
    component.rightPokemon.set(mockDetail(1, 7, 69));
    expect(component.isHeightWinner('right')).toBeTrue();
    expect(component.isWeightWinner('right')).toBeTrue();
    expect(component.isHeightWinner('left')).toBeFalse();
    expect(component.formatHeight(null)).toBe('—');
    expect(component.formatHeight(component.leftPokemon())).toBe('0.4 m');
    expect(component.formatWeight(component.rightPokemon())).toBe('6.9 kg');
  });

  it('returns false when stats are tied', () => {
    component.leftPokemon.set(mockDetail(25, 4, 60));
    component.rightPokemon.set(mockDetail(1, 4, 60));
    expect(component.isHeightWinner('left')).toBeFalse();
    expect(component.isWeightWinner('right')).toBeFalse();
  });

  it('clears a comparison side', () => {
    component.leftPokemon.set(mockDetail(25, 4, 60));
    component.clear('left');
    expect(component.leftPokemon()).toBeNull();
    expect(component.activeSide()).toBe('left');
  });

  it('focuses the other side after assigning one pokemon', () => {
    component.selectPokemon('left', 25);
    expect(component.activeSide()).toBe('right');
  });

  it('assigns search results to the active side', () => {
    component.activeSide.set('right');
    component.assignToActive(25);
    expect(component.rightPokemon()?.id).toBe(25);
  });

  it('swaps pokemon between sides', async () => {
    component.leftPokemon.set(mockDetail(25, 4, 60));
    component.rightPokemon.set(mockDetail(1, 7, 69));
    await component.swapSides();
    expect(component.leftPokemon()?.id).toBe(1);
    expect(component.rightPokemon()?.id).toBe(25);
    expect(component.duelPulse()).toBeGreaterThan(0);
  });

  it('picks a random matchup from the name index', () => {
    component.pickRandomMatchup();
    expect(pokemonService.getNameIndex).toHaveBeenCalled();
    expect(component.leftPokemon()?.id).toBeTruthy();
    expect(component.rightPokemon()?.id).toBeTruthy();
  });

  it('toggles focused stat rows', async () => {
    await component.toggleStatFocus('speed');
    expect(component.focusedStat()).toBe('speed');
    await component.toggleStatFocus('speed');
    expect(component.focusedStat()).toBeNull();
  });

  it('calculates total stat winners', () => {
    component.leftPokemon.set({
      ...mockDetail(25, 4, 60),
      stats: [
        { base_stat: 55, effort: 0, stat: { name: 'speed', url: '' } },
        { base_stat: 40, effort: 0, stat: { name: 'hp', url: '' } },
      ],
    });
    component.rightPokemon.set({
      ...mockDetail(1, 7, 69),
      stats: [{ base_stat: 65, effort: 0, stat: { name: 'attack', url: '' } }],
    });
    expect(component.getTotalStats(component.leftPokemon())).toBe(95);
    expect(component.isTotalWinner('left')).toBeTrue();
  });

  it('collects stat names and values from both sides', () => {
    component.leftPokemon.set({
      ...mockDetail(25, 4, 60),
      stats: [
        { base_stat: 55, effort: 0, stat: { name: 'speed', url: '' } },
        { base_stat: 40, effort: 0, stat: { name: 'hp', url: '' } },
      ],
    });
    component.rightPokemon.set({
      ...mockDetail(1, 7, 69),
      stats: [{ base_stat: 65, effort: 0, stat: { name: 'attack', url: '' } }],
    });

    expect(component.getStatNames().sort()).toEqual(['attack', 'hp', 'speed']);
    expect(component.getStatValue(component.leftPokemon(), 'speed')).toBe(55);
    expect(component.getStatValue(null, 'speed')).toBe(0);
  });
});
