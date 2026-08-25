export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface PrefixedStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

function getBrowserStorage(): StorageLike | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

export function createPrefixedStorage(prefix: string, storage?: StorageLike | null): PrefixedStorage {
  const resolve = () => (storage === undefined ? getBrowserStorage() : storage);

  return {
    get(key) {
      return resolve()?.getItem(`${prefix}${key}`) || null;
    },
    set(key, value) {
      resolve()?.setItem(`${prefix}${key}`, value);
    },
    remove(key) {
      resolve()?.removeItem(`${prefix}${key}`);
    }
  };
}
