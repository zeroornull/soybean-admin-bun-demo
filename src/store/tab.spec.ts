import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getGlobalTabsSetting } from '@/utils/storage';
import { getTabByRoute, useTabStore, type TabItem } from './tab';
import { resetSetupStore } from './plugins/reset';

type TabRoute = Parameters<typeof getTabByRoute>[0];

function createTabRoute(
  name: string,
  meta: {
    title: string;
    pinned?: boolean;
    keepAlive?: boolean;
    componentName?: string;
  }
): TabRoute {
  return {
    name,
    fullPath: `/${name}`,
    matched: [
      {
        name,
        meta: {
          title: meta.title,
          pinned: meta.pinned,
          keepAlive: meta.keepAlive,
          componentName: meta.componentName
        }
      } as TabRoute['matched'][number]
    ]
  };
}

const homeRoute = createTabRoute('home', {
  title: 'Home',
  pinned: true,
  keepAlive: true,
  componentName: 'Home'
});
const docsRoute = createTabRoute('docs', {
  title: 'Docs',
  keepAlive: true,
  componentName: 'Docs'
});
const settingsRoute = createTabRoute('settings', {
  title: 'Settings',
  keepAlive: true,
  componentName: 'Settings'
});

function tabIds(tabs: TabItem[]) {
  return tabs.map(tab => tab.id);
}

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

describe('tab store close rules', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    const pinia = createPinia();
    pinia.use(resetSetupStore);
    setActivePinia(pinia);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('moves to the left neighbor when the active tab is closed', async () => {
    const tabStore = useTabStore();

    tabStore.addTab(homeRoute);
    tabStore.addTab(docsRoute);
    tabStore.addTab(settingsRoute);
    tabStore.setActiveTab('settings');

    await tabStore.removeTab('settings');

    expect(tabIds(tabStore.tabs)).toEqual(['home', 'docs']);
    expect(tabStore.activeTabId).toBe('docs');
    expect(tabStore.cacheNames).toEqual(['Home', 'Docs']);
  });

  it('keeps the active tab when a different closable tab is removed', async () => {
    const tabStore = useTabStore();

    tabStore.addTab(homeRoute);
    tabStore.addTab(docsRoute);
    tabStore.addTab(settingsRoute);
    tabStore.setActiveTab('settings');

    await tabStore.removeTab('docs');

    expect(tabIds(tabStore.tabs)).toEqual(['home', 'settings']);
    expect(tabStore.activeTabId).toBe('settings');
  });

  it('rejects closing a pinned tab', async () => {
    const tabStore = useTabStore();

    tabStore.addTab(homeRoute);
    tabStore.addTab(docsRoute);
    tabStore.setActiveTab('docs');

    await expect(tabStore.removeTab('home')).resolves.toBe(false);
    expect(tabIds(tabStore.tabs)).toEqual(['home', 'docs']);
    expect(tabStore.activeTabId).toBe('docs');
  });

  it('reorders unpinned tabs and keeps the pinned tab first', () => {
    const tabStore = useTabStore();

    tabStore.addTab(homeRoute);
    tabStore.addTab(docsRoute);
    tabStore.addTab(settingsRoute);

    expect(tabStore.moveTab('settings', 'home')).toBe(true);
    expect(tabIds(tabStore.tabs)).toEqual(['home', 'settings', 'docs']);
  });

  it('restores cached tabs that still exist on the router', () => {
    const prefix = import.meta.env.VITE_STORAGE_PREFIX;
    localStorage.setItem(
      `${prefix}globalTabs`,
      JSON.stringify([
        {
          id: 'home',
          label: 'Home',
          routeName: 'home',
          fullPath: '/home',
          pinned: true,
          keepAlive: true,
          componentName: 'Home'
        },
        {
          id: 'docs',
          label: 'Docs',
          routeName: 'docs',
          fullPath: '/docs',
          pinned: false,
          keepAlive: true,
          componentName: 'Docs'
        },
        {
          id: 'ghost',
          label: 'Ghost',
          routeName: 'ghost',
          fullPath: '/ghost',
          pinned: false,
          keepAlive: false
        }
      ])
    );

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/home', name: 'home', component: { template: '<div />' } },
        { path: '/docs', name: 'docs', component: { template: '<div />' } }
      ]
    });
    const tabStore = useTabStore();

    tabStore.syncRoute(
      {
        name: 'docs',
        fullPath: '/docs',
        matched: docsRoute.matched
      } as Parameters<typeof tabStore.syncRoute>[0],
      router
    );

    expect(tabIds(tabStore.tabs)).toEqual(['home', 'docs']);
    expect(tabStore.activeTabId).toBe('docs');
  });

  it('clears cached tabs on logout', () => {
    const tabStore = useTabStore();
    tabStore.addTab(homeRoute);
    tabStore.addTab(docsRoute);

    expect(getGlobalTabsSetting()).toBeTruthy();

    tabStore.clearTabs();

    expect(tabStore.tabs).toEqual([]);
    expect(getGlobalTabsSetting()).toBeNull();
  });
});
