import type { Page, Route } from '@playwright/test';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

export interface MockPokemon {
  id: number;
  name: string;
  types: string[];
  stats: Record<string, number>;
  height?: number;
  weight?: number;
}

const DEFAULT_POKEMON: MockPokemon[] = [
  {
    id: 1,
    name: 'bulbasaur',
    types: ['grass', 'poison'],
    stats: { hp: 45, attack: 49, defense: 49, 'special-attack': 65, 'special-defense': 65, speed: 45 },
  },
  {
    id: 4,
    name: 'charmander',
    types: ['fire'],
    stats: { hp: 39, attack: 52, defense: 43, 'special-attack': 60, 'special-defense': 50, speed: 65 },
  },
  {
    id: 7,
    name: 'squirtle',
    types: ['water'],
    stats: { hp: 44, attack: 48, defense: 65, 'special-attack': 50, 'special-defense': 64, speed: 43 },
  },
  {
    id: 25,
    name: 'pikachu',
    types: ['electric'],
    stats: { hp: 35, attack: 55, defense: 40, 'special-attack': 50, 'special-defense': 50, speed: 90 },
  },
];

function createPokemonDetail(pokemon: MockPokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    height: pokemon.height ?? 7,
    weight: pokemon.weight ?? 69,
    sprites: {
      front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`,
      other: {
        'official-artwork': {
          front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
        },
      },
    },
    types: pokemon.types.map((type, index) => ({
      slot: index + 1,
      type: { name: type, url: `${POKEAPI_BASE}/type/${type}/` },
    })),
    stats: Object.entries(pokemon.stats).map(([statName, base_stat]) => ({
      base_stat,
      effort: 0,
      stat: { name: statName, url: `${POKEAPI_BASE}/stat/${statName}/` },
    })),
    abilities: [
      {
        ability: { name: 'blaze', url: `${POKEAPI_BASE}/ability/66/` },
        is_hidden: false,
        slot: 1,
      },
    ],
    moves: [
      {
        move: { name: 'tackle', url: `${POKEAPI_BASE}/move/33/` },
        version_group_details: [
          {
            level_learned_at: 1,
            move_learn_method: { name: 'level-up', url: `${POKEAPI_BASE}/move-learn-method/1/` },
            version_group: { name: 'red-blue', url: `${POKEAPI_BASE}/version-group/1/` },
          },
        ],
      },
    ],
  };
}

function createSpecies(pokemon: MockPokemon) {
  return {
    id: pokemon.id,
    name: pokemon.name,
    evolution_chain: { url: `${POKEAPI_BASE}/evolution-chain/${pokemon.id}/` },
    flavor_text_entries: [
      {
        flavor_text: `A premium mock entry for ${pokemon.name}.`,
        language: { name: 'en' },
      },
    ],
  };
}

function createEvolutionChain(pokemon: MockPokemon) {
  return {
    id: pokemon.id,
    chain: {
      species: {
        name: pokemon.name,
        url: `${POKEAPI_BASE}/pokemon-species/${pokemon.id}/`,
      },
      evolution_details: [],
      evolves_to: [],
    },
  };
}

function createTypeResponse(typeName: string, pokemonIds: number[]) {
  return {
    id: 1,
    name: typeName,
    pokemon: pokemonIds.map((id) => ({
      pokemon: {
        name: DEFAULT_POKEMON.find((entry) => entry.id === id)?.name ?? `pokemon-${id}`,
        url: `${POKEAPI_BASE}/pokemon/${id}/`,
      },
      slot: 1,
    })),
  };
}

function typePokemonIds(typeName: string): number[] {
  return DEFAULT_POKEMON.filter((pokemon) => pokemon.types.includes(typeName)).map(
    (pokemon) => pokemon.id,
  );
}

async function fulfillJson(route: Route, body: unknown, status = 200): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function mockPokeApi(page: Page, pokemon: MockPokemon[] = DEFAULT_POKEMON): Promise<void> {
  const pokemonById = new Map(pokemon.map((entry) => [entry.id, entry]));
  const pokemonByName = new Map(pokemon.map((entry) => [entry.name, entry]));

  await page.route('**/pokeapi.co/api/v2/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace('/api/v2', '');

    if (path === '/pokemon' && route.request().method() === 'GET') {
      await fulfillJson(route, {
        count: pokemon.length,
        next: null,
        previous: null,
        results: pokemon.map((entry) => ({
          name: entry.name,
          url: `${POKEAPI_BASE}/pokemon/${entry.id}/`,
        })),
      });
      return;
    }

    const pokemonMatch = path.match(/^\/pokemon\/(\d+)\/?$/);
    if (pokemonMatch) {
      const id = Number(pokemonMatch[1]);
      const entry = pokemonById.get(id);
      if (entry) {
        await fulfillJson(route, createPokemonDetail(entry));
        return;
      }
    }

    const speciesMatch = path.match(/^\/pokemon-species\/(\d+)\/?$/);
    if (speciesMatch) {
      const id = Number(speciesMatch[1]);
      const entry = pokemonById.get(id);
      if (entry) {
        await fulfillJson(route, createSpecies(entry));
        return;
      }
    }

    const evolutionMatch = path.match(/^\/evolution-chain\/(\d+)\/?$/);
    if (evolutionMatch) {
      const id = Number(evolutionMatch[1]);
      const entry = pokemonById.get(id);
      if (entry) {
        await fulfillJson(route, createEvolutionChain(entry));
        return;
      }
    }

    const typeMatch = path.match(/^\/type\/([a-z-]+)\/?$/);
    if (typeMatch) {
      const typeName = typeMatch[1];
      await fulfillJson(route, createTypeResponse(typeName, typePokemonIds(typeName)));
      return;
    }

    const namedPokemonMatch = path.match(/^\/pokemon\/([a-z-]+)\/?$/);
    if (namedPokemonMatch) {
      const entry = pokemonByName.get(namedPokemonMatch[1]);
      if (entry) {
        await fulfillJson(route, createPokemonDetail(entry));
        return;
      }
    }

    await route.continue();
  });
}
