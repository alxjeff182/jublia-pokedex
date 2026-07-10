import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { PokemonService } from './pokemon.service';
import { PokemonTypeService } from './pokemon-type.service';
import { environment } from '../../../environments/environment';
import { EvolutionNode, PokemonDetail } from '../models/pokemon.model';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpMock: HttpTestingController;
  let typeService: jasmine.SpyObj<PokemonTypeService>;

  const mockDetail = (id: number, name: string): PokemonDetail => ({
    id,
    name,
    height: 7,
    weight: 69,
    sprites: { front_default: `${name}.png` },
    types: [{ slot: 1, type: { name: 'electric', url: '' } }],
    stats: [],
    abilities: [],
    moves: [],
  });

  beforeEach(() => {
    typeService = jasmine.createSpyObj('PokemonTypeService', ['getTypePokemonIds']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: PokemonTypeService, useValue: typeService }],
    });
    service = TestBed.inject(PokemonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushNameIndex(): void {
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.pokeApiUrl}/pokemon` && r.params.get('limit') === '1300',
    );
    req.flush({
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
      ],
    });
  }

  it('filters ids by search term', (done) => {
    service.getFilteredIds({ search: 'pika' }).subscribe((ids) => {
      expect(ids).toEqual([25]);
      done();
    });
    flushNameIndex();
  });

  it('intersects multiple type filters', (done) => {
    typeService.getTypePokemonIds.and.callFake((type: string) => {
      if (type === 'electric') {
        return of([25]);
      }
      if (type === 'fire') {
        return of([4, 25]);
      }
      return of([]);
    });

    service.getFilteredIds({ types: ['electric', 'fire'] }).subscribe((ids) => {
      expect(ids).toEqual([25]);
      expect(typeService.getTypePokemonIds).toHaveBeenCalledWith('electric');
      expect(typeService.getTypePokemonIds).toHaveBeenCalledWith('fire');
      done();
    });
    flushNameIndex();
  });

  it('paginates pokemon page results', (done) => {
    service.getPokemonPage({}, 0, 1).subscribe((page) => {
      expect(page.items.length).toBe(1);
      expect(page.hasMore).toBeTrue();
      expect(page.total).toBe(3);
      done();
    });

    flushNameIndex();
    const detailReq = httpMock.expectOne(`${environment.pokeApiUrl}/pokemon/1`);
    detailReq.flush(mockDetail(1, 'bulbasaur'));
  });

  it('returns empty page when no ids match filters', (done) => {
    service.getPokemonPage({ search: 'zzzznotfound' }, 0, 20).subscribe((page) => {
      expect(page.items).toEqual([]);
      expect(page.hasMore).toBeFalse();
      done();
    });
    flushNameIndex();
  });

  it('filters ids by numeric search term', (done) => {
    service.getFilteredIds({ search: '25' }).subscribe((ids) => {
      expect(ids).toEqual([25]);
      done();
    });
    flushNameIndex();
  });

  it('returns empty search results for blank query', (done) => {
    service.searchPokemonByName('   ').subscribe((cards) => {
      expect(cards).toEqual([]);
      done();
    });
  });

  it('caches detail requests', () => {
    service.getPokemonDetail(25).subscribe();
    service.getPokemonDetail(25).subscribe();

    const requests = httpMock.match(`${environment.pokeApiUrl}/pokemon/25`);
    expect(requests.length).toBe(1);
    requests[0].flush(mockDetail(25, 'pikachu'));
  });

  it('returns cards for favorite ids', (done) => {
    service.getCardsByIds([25]).subscribe((cards) => {
      expect(cards.length).toBe(1);
      expect(cards[0].name).toBe('pikachu');
      expect(cards[0].types).toEqual(['electric']);
      done();
    });

    const req = httpMock.expectOne(`${environment.pokeApiUrl}/pokemon/25`);
    req.flush(mockDetail(25, 'pikachu'));
  });

  it('returns empty cards for empty id list', (done) => {
    service.getCardsByIds([]).subscribe((cards) => {
      expect(cards).toEqual([]);
      done();
    });
  });

  it('searches pokemon by name and returns cards', (done) => {
    service.searchPokemonByName('pika').subscribe((cards) => {
      expect(cards.length).toBe(1);
      expect(cards[0].id).toBe(25);
      done();
    });

    flushNameIndex();
    const detailReq = httpMock.expectOne(`${environment.pokeApiUrl}/pokemon/25`);
    detailReq.flush(mockDetail(25, 'pikachu'));
  });

  it('loads flavor text from species', (done) => {
    service.getFlavorText(25).subscribe((text) => {
      expect(text).toBe('It has small electric sacs on its cheeks.');
      done();
    });

    const speciesReq = httpMock.expectOne(
      `${environment.pokeApiUrl}/pokemon-species/25`,
    );
    speciesReq.flush({
      evolution_chain: { url: `${environment.pokeApiUrl}/evolution-chain/10/` },
      flavor_text_entries: [
        {
          flavor_text: 'It has small electric\nsacs on its cheeks.',
          language: { name: 'en', url: '' },
        },
      ],
    });
  });

  it('builds evolution chain nodes', fakeAsync(() => {
    const nodes: EvolutionNode[] = [];
    service.getEvolutionChain(1).subscribe((result) => nodes.push(...result));

    const speciesReq = httpMock.expectOne(
      `${environment.pokeApiUrl}/pokemon-species/1`,
    );
    speciesReq.flush({
      evolution_chain: { url: `${environment.pokeApiUrl}/evolution-chain/1/` },
      flavor_text_entries: [],
    });

    const chainReq = httpMock.expectOne(`${environment.pokeApiUrl}/evolution-chain/1/`);
    chainReq.flush({
      chain: {
        species: { name: 'bulbasaur', url: `${environment.pokeApiUrl}/pokemon-species/1/` },
        evolves_to: [
          {
            species: { name: 'ivysaur', url: `${environment.pokeApiUrl}/pokemon-species/2/` },
            evolves_to: [],
            evolution_details: [{ min_level: 16, trigger: { name: 'level-up', url: '' } }],
          },
        ],
        evolution_details: [],
      },
    });

    tick();
    httpMock.expectOne(`${environment.pokeApiUrl}/pokemon/1`).flush(mockDetail(1, 'bulbasaur'));
    tick();
    httpMock.expectOne(`${environment.pokeApiUrl}/pokemon/2`).flush(mockDetail(2, 'ivysaur'));
    tick();

    expect(nodes.length).toBe(2);
    expect(nodes[0].name).toBe('bulbasaur');
    expect(nodes[1].name).toBe('ivysaur');
  }));
});
