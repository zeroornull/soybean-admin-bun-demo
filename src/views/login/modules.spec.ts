import { describe, expect, it } from 'vitest';
import { getSafeRedirectPath, isValidCaptcha, isValidPhone, resolveLoginModule } from './modules';

describe('resolveLoginModule', () => {
  it('keeps known modules and falls back to password login', () => {
    expect(resolveLoginModule('code-login')).toBe('code-login');
    expect(resolveLoginModule('bind-wechat')).toBe('bind-wechat');
    expect(resolveLoginModule('nope')).toBe('pwd-login');
    expect(resolveLoginModule(undefined)).toBe('pwd-login');
  });
});

describe('login field checks', () => {
  it('accepts mainland mobile numbers and 6-digit codes', () => {
    expect(isValidPhone('13800138000')).toBe(true);
    expect(isValidPhone('13900139000')).toBe(true);
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidCaptcha('123456')).toBe(true);
    expect(isValidCaptcha('12')).toBe(false);
  });
});

describe('getSafeRedirectPath', () => {
  it('keeps in-app paths and rejects login or protocol-relative values', () => {
    expect(getSafeRedirectPath('/restricted')).toBe('/restricted');
    expect(getSafeRedirectPath('/home?from=login')).toBe('/home?from=login');
    expect(getSafeRedirectPath('//evil.example')).toBe('/home');
    expect(getSafeRedirectPath('/login')).toBe('/home');
    expect(getSafeRedirectPath('/login/code-login')).toBe('/home');
    expect(getSafeRedirectPath('https://evil.example')).toBe('/home');
    expect(getSafeRedirectPath(undefined)).toBe('/home');
  });
});
