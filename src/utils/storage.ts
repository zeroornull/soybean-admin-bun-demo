import { createPrefixedStorage } from '@sa/utils';

const storagePrefix = import.meta.env.VITE_STORAGE_PREFIX;
const storage = createPrefixedStorage(storagePrefix);

export const tokenStorageKey = `${storagePrefix}token`;
export const refreshTokenStorageKey = `${storagePrefix}refreshToken`;
export const localeStorageKey = `${storagePrefix}locale`;
export const themeSchemeStorageKey = `${storagePrefix}themeScheme`;
export const themeColorStorageKey = `${storagePrefix}themeColor`;

export function getAccessToken() {
  return storage.get('token');
}

export function setAccessToken(token: string) {
  storage.set('token', token);
}

export function clearAccessToken() {
  storage.remove('token');
}

export function getRefreshToken() {
  return storage.get('refreshToken');
}

export function setRefreshToken(token: string) {
  storage.set('refreshToken', token);
}

export function clearRefreshToken() {
  storage.remove('refreshToken');
}

export function getLocaleSetting() {
  return storage.get('locale');
}

export function setLocaleSetting(locale: string) {
  storage.set('locale', locale);
}

export function getThemeSchemeSetting() {
  return storage.get('themeScheme');
}

export function setThemeSchemeSetting(scheme: string) {
  storage.set('themeScheme', scheme);
}

export function getThemeColorSetting() {
  return storage.get('themeColor');
}

export function setThemeColorSetting(color: string) {
  storage.set('themeColor', color);
}

export function clearThemeSettings() {
  storage.remove('themeScheme');
  storage.remove('themeColor');
}
