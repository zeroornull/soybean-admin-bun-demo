import { describe, expect, it } from 'vitest';
import { createThemeColorPalette, isHexColor, mixHexColor, normalizeHexColor } from '@sa/color';

describe('color palette', () => {
  it('accepts only six-digit hex colors', () => {
    expect(isHexColor('#646cff')).toBe(true);
    expect(isHexColor('#ABCDEF')).toBe(true);
    expect(isHexColor('#fff')).toBe(false);
    expect(isHexColor('red')).toBe(false);
  });

  it('normalizes valid hex and falls back otherwise', () => {
    expect(normalizeHexColor('#ABCDEF', '#646cff')).toBe('#abcdef');
    expect(normalizeHexColor('nope', '#646cff')).toBe('#646cff');
  });

  it('mixes toward white or black and builds a primary palette', () => {
    expect(mixHexColor('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mixHexColor('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(mixHexColor('#000000', '#ffffff', 0.5)).toBe('#808080');

    const palette = createThemeColorPalette('#646cff');

    expect(palette.primaryColor).toBe('#646cff');
    expect(palette.primaryColorHover).not.toBe(palette.primaryColor);
    expect(palette.primaryColorPressed).not.toBe(palette.primaryColorHover);
    expect(palette.primaryColorSuppl).not.toBe(palette.primaryColorPressed);
  });
});
