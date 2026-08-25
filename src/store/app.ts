import { nextTick, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { initialLocale, syncLocale, type AppLocale } from '@/locales';
import { SetupStoreId } from './ids';
import { useTabStore } from './tab';

/** Global application shell state. */
export const useAppStore = defineStore(SetupStoreId.App, () => {
  const locale = ref<AppLocale>(initialLocale);
  const siderCollapse = ref(false);
  const themeDrawerVisible = ref(false);
  const reloadFlag = ref(true);
  const reloading = ref(false);
  const updateAvailable = ref(false);

  watch(locale, value => syncLocale(value), { flush: 'sync', immediate: true });

  function toggleSider() {
    siderCollapse.value = !siderCollapse.value;
  }

  function openThemeDrawer() {
    themeDrawerVisible.value = true;
  }

  function setLocale(nextLocale: AppLocale) {
    if (locale.value === nextLocale) return;

    locale.value = nextLocale;
  }

  function toggleLocale() {
    setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN');
  }

  function markUpdateAvailable() {
    updateAvailable.value = true;
  }

  function dismissUpdate() {
    updateAvailable.value = false;
  }

  async function reloadPage() {
    if (reloading.value) return false;

    const tabStore = useTabStore();

    if (!tabStore.activeTab) return false;

    reloading.value = true;
    tabStore.excludeActiveCache();

    try {
      // Let KeepAlive prune the active component before it leaves the render tree.
      await nextTick();
      reloadFlag.value = false;
      await nextTick();

      // Restore include before mounting the fresh instance so later navigation can cache it again.
      tabStore.restoreActiveCache();
      await nextTick();
      reloadFlag.value = true;
      await nextTick();

      return true;
    } finally {
      tabStore.restoreActiveCache();
      reloadFlag.value = true;
      reloading.value = false;
    }
  }

  return {
    locale,
    siderCollapse,
    themeDrawerVisible,
    reloadFlag,
    reloading,
    updateAvailable,
    markUpdateAvailable,
    dismissUpdate,
    openThemeDrawer,
    setLocale,
    toggleLocale,
    toggleSider,
    reloadPage
  };
});
