export interface PokemonListEntry {
  id: number;
  name: string;
}

export interface PokemonTypeSlot {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details?: Array<{
    level_learned_at: number;
    move_learn_method: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }>;
}

export type MoveLearnFilter = 'all' | 'level-up' | 'machine' | 'egg' | 'tutor';

export interface PokemonMoveEntry {
  name: string;
  label: string;
  learnMethods: string[];
  minLevel: number | null;
  primaryMethod: string;
}

const MOVE_METHOD_PRIORITY = ['level-up', 'machine', 'egg', 'tutor'] as const;

export interface PokemonSprites {
  front_default: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
    };
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: PokemonSprites;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  moves: PokemonMove[];
}

export interface PokemonSpecies {
  id: number;
  name: string;
  evolution_chain: {
    url: string;
  };
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
}

export interface EvolutionNode {
  id: number;
  name: string;
  sprite: string | null;
  primaryType?: string;
  minLevel?: number;
  trigger?: string;
  children: EvolutionNode[];
}

export interface PokemonCardData {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
}

export interface PokeApiListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PokeApiNamedResource {
  name: string;
  url: string;
}

export interface PokeApiTypeResponse {
  id: number;
  name: string;
  pokemon: Array<{
    pokemon: PokeApiNamedResource;
    slot: number;
  }>;
}

export interface EvolutionChainLink {
  species: PokeApiNamedResource;
  evolution_details: Array<{
    min_level: number | null;
    trigger: { name: string } | null;
  }>;
  evolves_to: EvolutionChainLink[];
}

export interface EvolutionChainResponse {
  id: number;
  chain: EvolutionChainLink;
}

export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

export { TYPE_COLORS, getTypeColor } from '../constants/design-tokens';

export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(3, '0')}`;
}

export function getPokemonSprite(pokemon: PokemonDetail): string | null {
  return (
    pokemon.sprites.other?.['official-artwork']?.front_default ??
    pokemon.sprites.front_default
  );
}

export function normalizePokemonMoves(moves: PokemonMove[]): PokemonMoveEntry[] {
  return moves
    .map((move) => {
      const details = move.version_group_details ?? [];
      const learnMethods = [
        ...new Set(details.map((detail) => detail.move_learn_method.name)),
      ];
      const levelUps = details.filter(
        (detail) => detail.move_learn_method.name === 'level-up',
      );
      const minLevel = levelUps.length
        ? Math.min(...levelUps.map((detail) => detail.level_learned_at))
        : null;
      const primaryMethod =
        MOVE_METHOD_PRIORITY.find((method) => learnMethods.includes(method)) ??
        learnMethods[0] ??
        'other';

      return {
        name: move.move.name,
        label: formatPokemonName(move.move.name),
        learnMethods,
        minLevel,
        primaryMethod,
      };
    })
    .sort((left, right) => left.label.localeCompare(right.label));
}

export function formatLearnMethod(method: string): string {
  const labels: Record<string, string> = {
    'level-up': 'Level Up',
    machine: 'TM / HM',
    egg: 'Egg',
    tutor: 'Tutor',
  };

  return labels[method] ?? formatPokemonName(method);
}

export function toCardData(pokemon: PokemonDetail): PokemonCardData {
  return {
    id: pokemon.id,
    name: pokemon.name,
    sprite: getPokemonSprite(pokemon),
    types: pokemon.types.map((t) => t.type.name),
  };
}
