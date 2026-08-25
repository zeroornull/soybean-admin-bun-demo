import { describe, expect, it } from 'vitest';
import { buildSvgSprite, resolveLocalIconHref, svgToSymbol, toSvgSymbolId } from './svg-sprite';

describe('svg sprite helpers', () => {
  it('builds symbol ids and keeps viewBox when wrapping raw svg', () => {
    expect(toSvgSymbolId('home.svg')).toBe('icon-local-home');
    expect(resolveLocalIconHref('lock')).toBe('#icon-local-lock');
    expect(resolveLocalIconHref('')).toBe('#icon-local-no-icon');
    expect(svgToSymbol('<svg viewBox="0 0 12 12"><path d="M0 0" /></svg>', 'icon-local-home')).toBe(
      '<symbol id="icon-local-home" viewBox="0 0 12 12"><path d="M0 0" /></symbol>'
    );
  });

  it('joins files into one hidden sprite', () => {
    const sprite = buildSvgSprite([
      { name: 'lock.svg', content: '<svg viewBox="0 0 24 24"><rect /></svg>' },
      { name: 'home.svg', content: '<svg viewBox="0 0 24 24"><path /></svg>' }
    ]);

    expect(sprite).toContain('id="__SVG_ICON_LOCAL__"');
    expect(sprite.indexOf('icon-local-home')).toBeLessThan(sprite.indexOf('icon-local-lock'));
  });
});
