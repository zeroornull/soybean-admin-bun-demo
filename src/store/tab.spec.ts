import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
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

describe('tab store close rules', () => {
  beforeEach(() => {
    const pinia = createPinia();
    pinia.use(resetSetupStore);
    setActivePinia(pinia);
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
});
