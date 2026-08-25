import { computed, inject, provide, ref, watch, type InjectionKey } from 'vue';
import { useRouter } from 'vue-router';
import { useRouteStore } from '@/store/route';
import { useThemeStore } from '@/store/theme';
import { findActiveFirstLevelKey, findMenuByKey, getLayoutChrome, menuHasChildren, pickMenus } from './layout-mode';

export function useLayoutShell() {
  const router = useRouter();
  const routeStore = useRouteStore();
  const themeStore = useThemeStore();
  const firstLevelOverride = ref<string | null>(null);

  const selectedFirstLevelKey = computed(() => findActiveFirstLevelKey(routeStore.menus, routeStore.selectedMenuKey));
  const activeFirstLevelKey = computed(() => firstLevelOverride.value || selectedFirstLevelKey.value);
  const activeFirstLevelMenu = computed(() => routeStore.menus.find(menu => menu.key === activeFirstLevelKey.value));
  const hasSecondLevel = computed(() => menuHasChildren(activeFirstLevelMenu.value));
  const chrome = computed(() => getLayoutChrome(themeStore.layoutMode, hasSecondLevel.value));
  const siderMenus = computed(() => pickMenus(routeStore.menus, chrome.value.siderMenus, activeFirstLevelKey.value));
  const headerMenus = computed(() => pickMenus(routeStore.menus, chrome.value.headerMenus, activeFirstLevelKey.value));
  const childSiderMenus = computed(() => pickMenus(routeStore.menus, 'second', activeFirstLevelKey.value));

  watch(selectedFirstLevelKey, () => {
    firstLevelOverride.value = null;
  });

  async function selectMenu(key: string, placement: 'sider' | 'header' | 'child') {
    const menu = findMenuByKey(routeStore.menus, key);

    if (placement === 'sider' && chrome.value.siderMenus === 'first' && menuHasChildren(menu)) {
      firstLevelOverride.value = key;
      return;
    }

    if (placement === 'header' && chrome.value.headerMenus === 'first' && menuHasChildren(menu)) {
      firstLevelOverride.value = key;
      return;
    }

    await router.push({ name: key });
  }

  return {
    chrome,
    siderMenus,
    headerMenus,
    childSiderMenus,
    activeFirstLevelKey,
    selectMenu
  };
}

type LayoutShell = ReturnType<typeof useLayoutShell>;

const layoutShellKey: InjectionKey<LayoutShell> = Symbol('layout-shell');

export function provideLayoutShell() {
  const shell = useLayoutShell();
  provide(layoutShellKey, shell);
  return shell;
}

export function useProvidedLayoutShell() {
  const shell = inject(layoutShellKey);

  if (!shell) {
    throw new Error('Layout shell was used outside BaseLayout');
  }

  return shell;
}
