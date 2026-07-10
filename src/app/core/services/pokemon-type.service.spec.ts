import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PokemonTypeService } from './pokemon-type.service';
import { environment } from '../../../environments/environment';

describe('PokemonTypeService', () => {
  let service: PokemonTypeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PokemonTypeService],
    });
    service = TestBed.inject(PokemonTypeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('extracts pokemon ids from type response', (done) => {
    service.getTypePokemonIds('fire').subscribe((ids) => {
      expect(ids).toEqual([4, 5]);
      done();
    });

    const req = httpMock.expectOne(`${environment.pokeApiUrl}/type/fire`);
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 10,
      name: 'fire',
      pokemon: [
        { pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' }, slot: 1 },
        { pokemon: { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon/5/' }, slot: 1 },
      ],
    });
  });

  it('reuses cached observable for the same type', () => {
    let first: unknown;
    let second: unknown;

    service.getTypePokemonIds('water').subscribe((v) => (first = v));
    service.getTypePokemonIds('water').subscribe((v) => (second = v));

    const requests = httpMock.match(`${environment.pokeApiUrl}/type/water`);
    expect(requests.length).toBe(1);
    requests[0].flush({
      id: 11,
      name: 'water',
      pokemon: [{ pokemon: { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' }, slot: 1 }],
    });

    expect(first).toEqual(second);
  });
});
