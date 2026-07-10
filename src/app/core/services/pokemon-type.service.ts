import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PokeApiTypeResponse } from '../models/pokemon.model';

@Injectable({ providedIn: 'root' })
export class PokemonTypeService {
  private readonly http = inject(HttpClient);
  private readonly typeCache = new Map<string, Observable<number[]>>();

  getTypePokemonIds(typeName: string): Observable<number[]> {
    const cached = this.typeCache.get(typeName);
    if (cached) {
      return cached;
    }

    const request$ = this.http
      .get<PokeApiTypeResponse>(`${environment.pokeApiUrl}/type/${typeName}`)
      .pipe(
        map((response) =>
          response.pokemon
            .map((entry) => this.extractIdFromUrl(entry.pokemon.url))
            .filter((id): id is number => id !== null),
        ),
        shareReplay(1),
      );

    this.typeCache.set(typeName, request$);
    return request$;
  }

  private extractIdFromUrl(url: string): number | null {
    const match = url.match(/\/pokemon\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
  }
}
