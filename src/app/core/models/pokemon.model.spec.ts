import {
  formatLearnMethod,
  formatPokemonId,
  formatPokemonName,
  getPokemonSprite,
  isPokemonSlugNumeric,
  isValidPokemonSlug,
  normalizePokemonMoves,
  pokemonDetailRoute,
  PokemonDetail,
  PokemonMove,
  toCardData,
  toPokemonSlug,
} from './pokemon.model';

describe('pokemon.model helpers', () => {
  describe('formatPokemonName', () => {
    it('capitalizes hyphenated names', () => {
      expect(formatPokemonName('mr-mime')).toBe('Mr Mime');
      expect(formatPokemonName('pikachu')).toBe('Pikachu');
    });

    it('returns empty string for blank input', () => {
      expect(formatPokemonName('')).toBe('');
    });
  });

  describe('formatPokemonId', () => {
    it('pads id to three digits', () => {
      expect(formatPokemonId(25)).toBe('#025');
      expect(formatPokemonId(1)).toBe('#001');
    });
  });

  describe('getPokemonSprite', () => {
    it('prefers official artwork over front default', () => {
      const pokemon = {
        sprites: {
          front_default: 'front.png',
          other: { 'official-artwork': { front_default: 'art.png' } },
        },
      } as PokemonDetail;

      expect(getPokemonSprite(pokemon)).toBe('art.png');
    });

    it('falls back to front_default', () => {
      const pokemon = {
        sprites: { front_default: 'front.png' },
      } as PokemonDetail;

      expect(getPokemonSprite(pokemon)).toBe('front.png');
    });

    it('returns null when no sprite is available', () => {
      const pokemon = { sprites: {} } as PokemonDetail;
      expect(getPokemonSprite(pokemon)).toBeFalsy();
    });
  });

  describe('normalizePokemonMoves', () => {
    it('sorts moves alphabetically by label', () => {
      const moves: PokemonMove[] = [
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
              level_learned_at: 1,
              move_learn_method: { name: 'machine', url: '' },
              version_group: { name: 'red-blue', url: '' },
            },
          ],
        },
      ];

      const result = normalizePokemonMoves(moves);
      expect(result.map((m) => m.name)).toEqual(['agility', 'thunderbolt']);
      expect(result[1].primaryMethod).toBe('level-up');
      expect(result[1].minLevel).toBe(26);
    });
  });

  describe('formatLearnMethod', () => {
    it('maps known methods to labels', () => {
      expect(formatLearnMethod('level-up')).toBe('Level Up');
      expect(formatLearnMethod('machine')).toBe('TM / HM');
      expect(formatLearnMethod('egg')).toBe('Egg');
      expect(formatLearnMethod('unknown')).toBe('Unknown');
    });
  });

  describe('toCardData', () => {
    it('maps detail to card data', () => {
      const detail = {
        id: 25,
        name: 'pikachu',
        sprites: { front_default: 'front.png' },
        types: [
          { slot: 1, type: { name: 'electric', url: '' } },
          { slot: 2, type: { name: 'flying', url: '' } },
        ],
      } as PokemonDetail;

      expect(toCardData(detail)).toEqual({
        id: 25,
        name: 'pikachu',
        sprite: 'front.png',
        types: ['electric', 'flying'],
      });
    });
  });

  describe('slug helpers', () => {
    it('normalizes pokemon names to slugs', () => {
      expect(toPokemonSlug('Pikachu')).toBe('pikachu');
      expect(toPokemonSlug('  mr-mime ')).toBe('mr-mime');
    });

    it('detects numeric legacy slugs', () => {
      expect(isPokemonSlugNumeric('299')).toBeTrue();
      expect(isPokemonSlugNumeric('pikachu')).toBeFalse();
    });

    it('validates slug format', () => {
      expect(isValidPokemonSlug('victreebel')).toBeTrue();
      expect(isValidPokemonSlug('mr-mime')).toBeTrue();
      expect(isValidPokemonSlug('299')).toBeTrue();
      expect(isValidPokemonSlug('not valid!')).toBeFalse();
    });

    it('builds detail routes from names', () => {
      expect(pokemonDetailRoute('Victreebel')).toEqual(['/pokemon', 'victreebel']);
    });
  });
});
