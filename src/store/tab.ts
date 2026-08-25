import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { SetupStoreId } from './ids';

type TabRoute = Pick<RouteLocationNormalizedLoaded, 'fullPath' | 'matched'> & {
  name: RouteLocationNormalizedLoaded['name'] | null | undefined;
};

export interface TabItem {
  id: string;
  label: string;
  labelKey?: string;
  routeName: string;
  fullPath: string;
  pinned: boolean;
  keepAlive: boolean;
  componentName?: string;
}

function getCurrentRouteMeta(route: TabRoute) {
  return route.matched.find(record => record.name === route.name)?.meta;
}

export function getTabByRoute(route: TabRoute): TabItem | null {
  if (!route.name) return null;

  const meta = getCurrentRouteMeta(route);
  const label = meta?.title || meta?.i18nKey || '';

  if (!meta || !label || meta.constant || meta.hideInMenu || meta.hideInTab) return null;

  const routeName = String(route.name);

  return {
    id: routeName,
    label,
    labelKey: meta.i18nKey,
    routeName,
    fullPath: route.fullPath,
    pinned: Boolean(meta.pinned),
    keepAlive: Boolean(meta.keepAlive && meta.componentName),
    componentName: meta.componentName
  };
}

/** Route-name tabs and their component-name cache lifecycle. */
export const useTabStore = defineStore(SetupStoreId.Tab, () => {
  const tabs = ref<TabItem[]>([]);
  const activeTabId = ref('');
  const excludedCacheName = ref('');
  const activeTab = computed(() => tabs.value.find(tab => tab.id === activeTabId.value));
  const cacheNames = computed(() => [
    ...new Set(
      tabs.value.flatMap(tab =>
        tab.keepAlive && tab.componentName && tab.componentName !== excludedCacheName.value ? [tab.componentName] : []
      )
    )
  ]);

  let activeRouter: Router | undefined;

  function insertTab(tab: TabItem) {
    if (!tab.pinned) {
      tabs.value.push(tab);
      return;
    }

    const firstUnpinnedIndex = tabs.value.findIndex(item => !item.pinned);
    const insertIndex = firstUnpinnedIndex === -1 ? tabs.value.length : firstUnpinnedIndex;
    tabs.value.splice(insertIndex, 0, tab);
  }

  function addTab(route: TabRoute) {
    const tab = getTabByRoute(route);
    if (!tab) return null;

    const existingTab = tabs.value.find(item => item.id === tab.id);

    if (existingTab) {
      Object.assign(existingTab, tab);
    } else {
      insertTab(tab);
    }

    return existingTab || tab;
  }

  function setActiveTab(id: string) {
    if (tabs.value.some(tab => tab.id === id)) activeTabId.value = id;
  }

  function ensureHomeTab(targetRouter: Router) {
    const homeRoute = targetRouter.resolve({ name: import.meta.env.VITE_ROUTE_HOME });
    const homeTab = getTabByRoute(homeRoute);

    if (!homeTab || tabs.value.some(tab => tab.id === homeTab.id)) return;

    insertTab({ ...homeTab, pinned: true });
  }

  function syncRoute(route: RouteLocationNormalizedLoaded, targetRouter: Router) {
    const currentTab = getTabByRoute(route);
    if (!currentTab) return;

    activeRouter = targetRouter;
    ensureHomeTab(targetRouter);

    const tab = addTab(route);
    if (tab) setActiveTab(tab.id);
  }

  async function switchTab(id: string) {
    const tab = tabs.value.find(item => item.id === id);
    if (!tab) return false;

    if (!activeRouter) {
      setActiveTab(id);
      return true;
    }

    try {
      await activeRouter.push(tab.fullPath);
      setActiveTab(id);
      return true;
    } catch {
      return false;
    }
  }

  async function removeTab(id: string) {
    const removeIndex = tabs.value.findIndex(tab => tab.id === id);
    if (removeIndex === -1 || tabs.value[removeIndex].pinned) return false;

    const isRemovingActiveTab = activeTabId.value === id;
    const nextTab = isRemovingActiveTab ? tabs.value[removeIndex - 1] || tabs.value[removeIndex + 1] : undefined;

    tabs.value.splice(removeIndex, 1);

    if (isRemovingActiveTab) {
      if (nextTab) {
        await switchTab(nextTab.id);
      } else {
        activeTabId.value = '';
      }
    }

    return true;
  }

  async function removeOthers(id: string) {
    const targetTab = tabs.value.find(tab => tab.id === id);
    if (!targetTab) return false;

    const activeTabRemoved = !tabs.value.some(tab => tab.id === activeTabId.value && (tab.pinned || tab.id === id));
    tabs.value = tabs.value.filter(tab => tab.pinned || tab.id === id);

    if (activeTabRemoved) await switchTab(targetTab.id);

    return true;
  }

  async function removeAll() {
    const pinnedTabs = tabs.value.filter(tab => tab.pinned);
    const activeTabRemoved = !pinnedTabs.some(tab => tab.id === activeTabId.value);

    tabs.value = pinnedTabs;

    if (activeTabRemoved) {
      if (pinnedTabs[0]) {
        await switchTab(pinnedTabs[0].id);
      } else {
        activeTabId.value = '';
      }
    }
  }

  function clearTabs() {
    tabs.value = [];
    activeTabId.value = '';
    excludedCacheName.value = '';
    activeRouter = undefined;
  }

  function excludeActiveCache() {
    excludedCacheName.value = activeTab.value?.componentName || '';
  }

  function restoreActiveCache() {
    excludedCacheName.value = '';
  }

  return {
    tabs,
    activeTabId,
    activeTab,
    cacheNames,
    addTab,
    removeTab,
    removeOthers,
    removeAll,
    setActiveTab,
    switchTab,
    syncRoute,
    clearTabs,
    excludeActiveCache,
    restoreActiveCache
  };
});
