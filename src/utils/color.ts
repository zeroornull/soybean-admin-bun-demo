export interface ThemeColorPalette {
  primaryColor: string;
  primaryColorHover: string;
  primaryColorPressed: string;
  primaryColorSuppl: string;
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
}

export function normalizeHexColor(value: unknown, fallback: string) {
  return isHexColor(value) ? value.toLowerCase() : fallback;
}

function hexToRgb(color: string) {
  return {
    red: Number.parseInt(color.slice(1, 3), 16),
    green: Number.parseInt(color.slice(3, 5), 16),
    blue: Number.parseInt(color.slice(5, 7), 16)
  };
}

function toHex(value: number) {
  return Math.round(value).toString(16).padStart(2, '0');
}

export function mixHexColor(color: string, target: '#000000' | '#ffffff', weight: number) {
  const sourceRgb = hexToRgb(color);
  const targetRgb = hexToRgb(target);
  const ratio = Math.min(Math.max(weight, 0), 1);

  return `#${toHex(sourceRgb.red + (targetRgb.red - sourceRgb.red) * ratio)}${toHex(
    sourceRgb.green + (targetRgb.green - sourceRgb.green) * ratio
  )}${toHex(sourceRgb.blue + (targetRgb.blue - sourceRgb.blue) * ratio)}`;
}

export function createThemeColorPalette(color: string): ThemeColorPalette {
  return {
    primaryColor: color,
    primaryColorHover: mixHexColor(color, '#ffffff', 0.16),
    primaryColorPressed: mixHexColor(color, '#000000', 0.18),
    primaryColorSuppl: mixHexColor(color, '#ffffff', 0.08)
  };
}
