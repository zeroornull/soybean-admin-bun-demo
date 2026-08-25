import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetSetupStore } from './plugins/reset';
import { useThemeStore } from './theme';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();

  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index) {
      return [...map.keys()][index] ?? null;
    },
    removeItem(key) {
      map.delete(key);
    },
    setItem(key, value) {
      map.set(String(key), String(value));
    }
  };
}

describe('theme layout mode', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    const pinia = createPinia();
    pinia.use(resetSetupStore);
    setActivePinia(pinia);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists a valid mode and ignores unknown values', () => {
    const themeStore = useThemeStore();

    themeStore.setLayoutMode('horizontal');
    expect(themeStore.layoutMode).toBe('horizontal');
    expect(localStorage.getItem(`${import.meta.env.VITE_STORAGE_PREFIX}layoutMode`)).toBe('horizontal');

    themeStore.setLayoutMode('not-a-mode' as never);
    expect(themeStore.layoutMode).toBe('vertical');
  });

  it('resets layout mode with the rest of the theme', () => {
    const themeStore = useThemeStore();
    themeStore.setLayoutMode('vertical-mix');
    themeStore.resetTheme();
    expect(themeStore.layoutMode).toBe('vertical');
  });
});
