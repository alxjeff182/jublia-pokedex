import {
  BRAND_COLORS,
  DESIGN_TOKENS,
  TYPE_COLORS,
  getTypeAuraGradient,
  getTypeAuraGradientOuter,
  getTypeChipTextColor,
  getTypeColor,
  getTypeTintColor,
  hexToRgba,
} from './design-tokens';

describe('design-tokens', () => {
  it('exposes brand and layout tokens', () => {
    expect(BRAND_COLORS.primary).toBe('#E53935');
    expect(DESIGN_TOKENS.cardRadius).toBe('20px');
    expect(TYPE_COLORS['fire']).toBe('#F08030');
  });

  it('returns type color with normal fallback', () => {
    expect(getTypeColor('water')).toBe('#6890F0');
    expect(getTypeColor('unknown')).toBe(TYPE_COLORS['normal']);
  });

  it('builds tint and rgba helpers', () => {
    expect(getTypeTintColor('fire')).toMatch(/^#[0-9a-f]{6}$/i);
    expect(hexToRgba('#F08030', 0.5)).toBe('rgba(240, 128, 48, 0.5)');
  });

  it('builds aura gradients', () => {
    expect(getTypeAuraGradient('grass')).toContain('radial-gradient');
    expect(getTypeAuraGradientOuter('grass')).toContain('radial-gradient');
  });

  it('picks readable chip text color', () => {
    expect(getTypeChipTextColor('electric', false)).toBe(TYPE_COLORS['electric']);
    expect(getTypeChipTextColor('electric', true)).toBe('#1A1A1A');
    expect(getTypeChipTextColor('fire', true)).toBe('#FFFFFF');
  });
});
