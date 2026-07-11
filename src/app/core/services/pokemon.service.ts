import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  catchError,
  concatMap,
  firstValueFrom,
  forkJoin,
  from,
  map,
  of,
  reduce,
  shareReplay,
  switchMap,
} from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EvolutionChainLink,
  EvolutionChainResponse,
  EvolutionNode,
  PokemonCardData,
  PokemonDetail,
  PokemonListEntry,
  PokemonSpecies,
  PokeApiListResponse,
  getPokemonSprite,
  toCardData,
} from '../models/pokemon.model';
import { PokemonTypeService } from './pokemon-type.service';

export interface PokemonListFilters {
  search?: string;
  types?: string[];
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly http = inject(HttpClient);
  private readonly typeService = inject(PokemonTypeService);

  private nameIndex$?: Observable<PokemonListEntry[]>;
  private readonly detailCache = new Map<string, Observable<PokemonDetail>>();
  private readonly batchSize = 5;

  getNameIndex(): Observable<PokemonListEntry[]> {
    if (!this.nameIndex$) {
      this.nameIndex$ = this.http
        .get<PokeApiListResponse<{ name: string; url: string }>>(
          `${environment.pokeApiUrl}/pokemon`,
          { params: { limit: '1300' } },
        )
        .pipe(
          map((response) =>
            response.results.map((item) => ({
              id: this.extractIdFromUrl(item.url) ?? 0,
              name: item.name,
            })),
          ),
          shareReplay(1),
        );
    }
    return this.nameIndex$;
  }

  getFilteredIds(filters: PokemonListFilters): Observable<number[]> {
    return this.getNameIndex().pipe(
      switchMap((entries) => {
        let ids = entries.map((entry) => entry.id).filter((id) => id > 0);

        const search = filters.search?.trim().toLowerCase();
        if (search) {
          ids = entries
            .filter(
              (entry) =>
                entry.name.includes(search) ||
                entry.id.toString().includes(search),
            )
            .map((entry) => entry.id);
        }

        const types = filters.types ?? [];
        if (types.length === 0) {
          return of(ids);
        }

        return forkJoin(types.map((type) => this.typeService.getTypePokemonIds(type))).pipe(
          map((typeIdLists) => {
            const typeSets = typeIdLists.map((list) => new Set(list));
            return ids.filter((id) => typeSets.every((set) => set.has(id)));
          }),
        );
      }),
    );
  }

  getPokemonPage(
    filters: PokemonListFilters,
    offset: number,
    limit: number,
  ): Observable<{ items: PokemonCardData[]; hasMore: boolean; total: number }> {
    return this.getFilteredIds(filters).pipe(
      switchMap((ids) => {
        const slice = ids.slice(offset, offset + limit);
        const hasMore = offset + limit < ids.length;

        if (slice.length === 0) {
          return of({ items: [], hasMore: false, total: ids.length });
        }

        return this.fetchDetailsBatched(slice).pipe(
          map((details) => ({
            items: details.map((detail) => toCardData(detail)),
            hasMore,
            total: ids.length,
          })),
        );
      }),
    );
  }

  getPokemonDetail(ref: string | number): Observable<PokemonDetail> {
    const key = String(ref).toLowerCase();
    const cached = this.detailCache.get(key);
    if (cached) {
      return cached;
    }

    const request$ = this.http
      .get<PokemonDetail>(`${environment.pokeApiUrl}/pokemon/${key}`)
      .pipe(shareReplay(1));

    this.detailCache.set(key, request$);
    return request$;
  }

  getPokemonSpecies(id: number): Observable<PokemonSpecies> {
    return this.http.get<PokemonSpecies>(
      `${environment.pokeApiUrl}/pokemon-species/${id}`,
    );
  }

  getEvolutionChain(id: number): Observable<EvolutionNode[]> {
    return this.getPokemonSpecies(id).pipe(
      switchMap((species) =>
        this.http.get<EvolutionChainResponse>(species.evolution_chain.url),
      ),
      switchMap((chain) => from(this.buildEvolutionNodes(chain.chain))),
    );
  }

  getFlavorText(id: number): Observable<string> {
    return this.getPokemonSpecies(id).pipe(
      map((species) => {
        const entry = species.flavor_text_entries.find(
          (item) => item.language.name === 'en',
        );
        return entry?.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') ?? '';
      }),
    );
  }

  getCardsByIds(ids: number[]): Observable<PokemonCardData[]> {
    if (ids.length === 0) {
      return of([]);
    }

    return this.fetchDetailsBatched(ids).pipe(
      map((details) => details.map((detail) => toCardData(detail))),
    );
  }

  searchPokemonByName(query: string): Observable<PokemonCardData[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return of([]);
    }

    return this.getNameIndex().pipe(
      map((entries) =>
        entries
          .filter((entry) => entry.name.includes(normalized))
          .slice(0, 10)
          .map((entry) => entry.id),
      ),
      switchMap((ids) => this.getCardsByIds(ids)),
      catchError(() => of([])),
    );
  }

  private fetchDetailsBatched(ids: number[]): Observable<PokemonDetail[]> {
    if (ids.length === 0) {
      return of([]);
    }

    const batches: number[][] = [];
    for (let i = 0; i < ids.length; i += this.batchSize) {
      batches.push(ids.slice(i, i + this.batchSize));
    }

    return from(batches).pipe(
      concatMap((batch) => forkJoin(batch.map((id) => this.getPokemonDetail(id)))),
      reduce((acc, batch) => [...acc, ...batch], [] as PokemonDetail[]),
    );
  }

  private async buildEvolutionNodes(
    root: EvolutionChainLink,
  ): Promise<EvolutionNode[]> {
    const linear = this.flattenLinearChain(root);
    const nodes: EvolutionNode[] = [];

    for (const link of linear) {
      const pokemonId = this.extractIdFromSpeciesUrl(link.species.url);
      if (!pokemonId) {
        continue;
      }

      const detail = await firstValueFrom(
        this.getPokemonDetail(pokemonId).pipe(catchError(() => of(null))),
      );
      const detailInfo = link.evolution_details[0];

      nodes.push({
        id: pokemonId,
        name: link.species.name,
        sprite: detail ? getPokemonSprite(detail) : null,
        primaryType: detail?.types[0]?.type.name,
        minLevel: detailInfo?.min_level ?? undefined,
        trigger: detailInfo?.trigger?.name,
        children: [],
      });
    }

    return nodes;
  }

  private flattenLinearChain(link: EvolutionChainLink): EvolutionChainLink[] {
    const result: EvolutionChainLink[] = [link];
    let current = link;

    while (current.evolves_to.length > 0) {
      current = current.evolves_to[0];
      result.push(current);
    }

    return result;
  }

  private extractIdFromUrl(url: string): number | null {
    const match = url.match(/\/pokemon\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
  }

  private extractIdFromSpeciesUrl(url: string): number | null {
    const match = url.match(/\/pokemon-species\/(\d+)\/?$/);
    return match ? Number(match[1]) : null;
  }
}
