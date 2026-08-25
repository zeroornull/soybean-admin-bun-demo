import { describe, expect, it } from 'vitest';
import {
  clampThemeRadius,
  defaultThemeExtras,
  getThemePreset,
  parseThemeExtras,
  resolveWatermarkContent
} from './settings';

describe('clampThemeRadius', () => {
  it('rounds and clamps to 0–16', () => {
    expect(clampThemeRadius(6.4)).toBe(6);
    expect(clampThemeRadius(-2)).toBe(0);
    expect(clampThemeRadius(99)).toBe(16);
    expect(clampThemeRadius('nope')).toBe(defaultThemeExtras.radius);
  });
});

describe('parseThemeExtras', () => {
  it('fills defaults and keeps username/time mutually exclusive', () => {
    const parsed = parseThemeExtras({
      radius: 12,
      grayscale: true,
      watermark: { visible: true, text: '  ', enableUserName: true, enableTime: true },
      blocks: { tabs: false, footer: true }
    });

    expect(parsed.radius).toBe(12);
    expect(parsed.grayscale).toBe(true);
    expect(parsed.watermark).toMatchObject({
      visible: true,
      text: 'SoybeanAdmin',
      enableUserName: true,
      enableTime: false
    });
    expect(parsed.blocks).toEqual({ tabs: false, breadcrumb: true, footer: true, search: true });
  });

  it('returns defaults for invalid JSON', () => {
    expect(parseThemeExtras('{')).toEqual(defaultThemeExtras);
    expect(parseThemeExtras(null)).toEqual(defaultThemeExtras);
  });
});

describe('resolveWatermarkContent', () => {
  const base = { visible: true, text: 'SoybeanAdmin', enableUserName: false, enableTime: false };

  it('returns empty when hidden', () => {
    expect(resolveWatermarkContent({ ...base, visible: false }, 'Soybean', '2026-08-25')).toBe('');
  });

  it('prefers user name, then time, then custom text', () => {
    expect(resolveWatermarkContent({ ...base, enableUserName: true }, 'Soybean', 'now')).toBe('Soybean');
    expect(resolveWatermarkContent({ ...base, enableUserName: true }, null, 'now')).toBe('SoybeanAdmin');
    expect(resolveWatermarkContent({ ...base, enableTime: true }, 'Soybean', '2026-08-25 12:00:00')).toBe(
      '2026-08-25 12:00:00'
    );
    expect(resolveWatermarkContent(base, 'Soybean', 'now')).toBe('SoybeanAdmin');
  });
});

describe('themePresets', () => {
  it('exposes default compact and azir presets', () => {
    expect(getThemePreset('compact')?.layoutMode).toBe('horizontal');
    expect(getThemePreset('compact')?.extras.radius).toBe(2);
    expect(getThemePreset('azir')?.themeScheme).toBe('dark');
    expect(getThemePreset('missing')).toBeNull();
  });
});
