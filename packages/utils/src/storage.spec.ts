import { describe, expect, it } from 'vitest';
import { createPrefixedStorage, type StorageLike } from '@sa/utils';

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

describe('createPrefixedStorage', () => {
  it('reads and writes values under the given prefix', () => {
    const memory = createMemoryStorage();
    const storage = createPrefixedStorage('SOY_', memory);

    storage.set('token', 'access-token');

    expect(memory.getItem('SOY_token')).toBe('access-token');
    expect(storage.get('token')).toBe('access-token');
  });

  it('removes prefixed keys and no-ops when storage is unavailable', () => {
    const memory = createMemoryStorage();
    const storage = createPrefixedStorage('SOY_', memory);
    const unavailable = createPrefixedStorage('SOY_', null);

    storage.set('token', 'access-token');
    storage.remove('token');

    expect(storage.get('token')).toBeNull();
    expect(unavailable.get('token')).toBeNull();
    expect(() => unavailable.set('token', 'x')).not.toThrow();
    expect(() => unavailable.remove('token')).not.toThrow();
  });
});
