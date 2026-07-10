// Brand & surface tokens (single source of truth for TypeScript usage)
export const BRAND_COLORS = {
  primary: '#E53935',
  background: '#F5F5F7',
  surface: '#FFFFFF',
  secondary: '#00B8D9',
  text: '#1A1A1A',
  textMuted: '#5C5C61',
  border: '#ECECF1',
} as const;

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

export const DESIGN_TOKENS = {
  cardRadius: '20px',
  chipRadius: '999px',
  shadowSoft: '0 4px 12px rgba(0, 0, 0, 0.06)',
  shadowMedium: '0 8px 24px rgba(0, 0, 0, 0.08)',
} as const;

export function getTypeColor(typeName: string): string {
  return TYPE_COLORS[typeName] ?? TYPE_COLORS['normal'];
}

export function getTypeTintColor(typeName: string, mix = 0.14): string {
  const hex = getTypeColor(typeName).replace('#', '');
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const tintR = Math.round(r * mix + 255 * (1 - mix));
  const tintG = Math.round(g * mix + 255 * (1 - mix));
  const tintB = Math.round(b * mix + 255 * (1 - mix));

  return `#${tintR.toString(16).padStart(2, '0')}${tintG
    .toString(16)
    .padStart(2, '0')}${tintB.toString(16).padStart(2, '0')}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Dense inner glow behind list-card sprites (mockup style). */
export function getTypeAuraGradient(typeName: string): string {
  const color = getTypeColor(typeName);
  return `radial-gradient(circle at center, ${hexToRgba(color, 0.78)} 0%, ${hexToRgba(color, 0.55)} 30%, ${hexToRgba(color, 0.34)} 52%, ${hexToRgba(color, 0.16)} 70%, ${hexToRgba(color, 0.05)} 84%, transparent 94%)`;
}

/** Wider soft halo to make the aura feel thicker on the card. */
export function getTypeAuraGradientOuter(typeName: string): string {
  const color = getTypeColor(typeName);
  return `radial-gradient(circle at center, ${hexToRgba(color, 0.42)} 0%, ${hexToRgba(color, 0.24)} 40%, ${hexToRgba(color, 0.1)} 62%, transparent 82%)`;
}

/** Pick white or dark label text for solid type chips on cards. */
export function getTypeChipTextColor(typeName: string, selected: boolean): string {
  if (!selected) {
    return getTypeColor(typeName);
  }

  const hex = getTypeColor(typeName).replace('#', '');
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.62 ? '#1A1A1A' : '#FFFFFF';
}
