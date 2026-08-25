export const defaultIframeSrc = '/iframe-demo.html';

function firstString(value: unknown) {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return '';
}

export function resolveIframeSrc(raw: unknown, fallback = defaultIframeSrc) {
  const value = firstString(raw).trim();

  if (!value) return fallback;

  let decoded = value;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    return '';
  }

  if (decoded.startsWith('/') && !decoded.startsWith('//')) return decoded;

  try {
    const url = new URL(decoded);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch {
    return '';
  }

  return '';
}

export function encodeIframeParam(src: string) {
  return encodeURIComponent(src);
}
