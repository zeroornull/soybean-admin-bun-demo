import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { constantRoutes } from '@/router/routes';
import { clearAccessToken, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from '@/utils/storage';
import { useAuthStore } from './auth';
import { resetSetupStore } from './plugins/reset';
import { useRouteStore } from './route';
import { getTabByRoute, useTabStore } from './tab';

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

describe('auth resetStore', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());

    const pinia = createPinia();
    pinia.use(resetSetupStore);
    setActivePinia(pinia);
  });

  afterEach(() => {
    clearAccessToken();
    vi.unstubAllGlobals();
  });

  it('clears tokens, userInfo, auth routes, tabs and storage', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: constantRoutes
    });
    const authStore = useAuthStore();
    const routeStore = useRouteStore();
    const tabStore = useTabStore();

    setAccessToken('access-token');
    setRefreshToken('refresh-token');
    authStore.token = 'access-token';
    authStore.refreshToken = 'refresh-token';
    authStore.userInfo = {
      userId: '1',
      userName: 'Soybean',
      roles: ['R_SUPER'],
      buttons: []
    };

    routeStore.initAuthRoute(['R_SUPER'], router);
    tabStore.addTab({
      name: 'home',
      fullPath: '/home',
      matched: [
        {
          name: 'home',
          meta: { title: 'Home', pinned: true, keepAlive: true, componentName: 'Home' }
        } as Parameters<typeof getTabByRoute>[0]['matched'][number]
      ]
    });
    tabStore.setActiveTab('home');

    expect(router.hasRoute('home')).toBe(true);
    expect(tabStore.tabs).toHaveLength(1);

    await authStore.resetStore({ redirect: false, reason: 'logged out' });

    expect(authStore.token).toBe('');
    expect(authStore.refreshToken).toBe('');
    expect(authStore.userInfo).toBeNull();
    expect(authStore.authError).toBe('logged out');
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
    expect(tabStore.tabs).toEqual([]);
    expect(tabStore.activeTabId).toBe('');
    expect(routeStore.authorizedRouteNames).toEqual([]);
    expect(routeStore.menus).toEqual([]);
    expect(routeStore.isAuthRouteInitialized).toBe(false);
    expect(router.hasRoute('home')).toBe(false);
    expect(router.hasRoute('restricted')).toBe(false);
  });
});
