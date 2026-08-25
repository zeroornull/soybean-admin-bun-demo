import { describe, expect, it } from 'vitest';
import { defaultIframeSrc, encodeIframeParam, resolveIframeSrc } from './src';

describe('resolveIframeSrc', () => {
  it('falls back to the same-origin demo page and keeps safe http(s) or in-app paths', () => {
    expect(resolveIframeSrc(undefined)).toBe(defaultIframeSrc);
    expect(resolveIframeSrc('')).toBe(defaultIframeSrc);
    expect(resolveIframeSrc(encodeIframeParam('/iframe-demo.html'))).toBe('/iframe-demo.html');
    expect(resolveIframeSrc('https://example.com/docs')).toBe('https://example.com/docs');
    expect(resolveIframeSrc('http://127.0.0.1:19007/health')).toBe('http://127.0.0.1:19007/health');
  });

  it('rejects protocol-relative, javascript and data URLs', () => {
    expect(resolveIframeSrc('//evil.example')).toBe('');
    expect(resolveIframeSrc('javascript:alert(1)')).toBe('');
    expect(resolveIframeSrc('data:text/html,hi')).toBe('');
    expect(resolveIframeSrc('%E0%A4%A')).toBe('');
  });
});
