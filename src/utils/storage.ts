const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX;

export const tokenStorageKey = `${storagePrefix}token`;
export const refreshTokenStorageKey = `${storagePrefix}refreshToken`;
export const localeStorageKey = `${storagePrefix}locale`;

function getStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

export function getAccessToken() {
  return getStorage()?.getItem(tokenStorageKey) || null;
}

export function setAccessToken(token: string) {
  getStorage()?.setItem(tokenStorageKey, token);
}

export function clearAccessToken() {
  getStorage()?.removeItem(tokenStorageKey);
}

export function getRefreshToken() {
  return getStorage()?.getItem(refreshTokenStorageKey) || null;
}

export function setRefreshToken(token: string) {
  getStorage()?.setItem(refreshTokenStorageKey, token);
}

export function clearRefreshToken() {
  getStorage()?.removeItem(refreshTokenStorageKey);
}

export function getLocaleSetting() {
  return getStorage()?.getItem(localeStorageKey) || null;
}

export function setLocaleSetting(locale: string) {
  getStorage()?.setItem(localeStorageKey, locale);
}
