import { describe, expect, it } from 'vitest';
import { normalizePublicBase } from './public-base';

describe('normalizePublicBase', () => {
  it('keeps the root path as a single slash', () => {
    expect(normalizePublicBase(undefined)).toBe('/');
    expect(normalizePublicBase('')).toBe('/');
    expect(normalizePublicBase('/')).toBe('/');
  });

  it('forces a leading and trailing slash for nested public paths', () => {
    expect(normalizePublicBase('admin')).toBe('/admin/');
    expect(normalizePublicBase('/admin')).toBe('/admin/');
    expect(normalizePublicBase('/admin/')).toBe('/admin/');
  });
});
