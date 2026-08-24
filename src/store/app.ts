import { nextTick, ref } from 'vue';
import { defineStore } from 'pinia';
import { SetupStoreId } from './ids';
import { useTabStore } from './tab';

/** Global application shell state. */
export const useAppStore = defineStore(SetupStoreId.App, () => {
  const siderCollapse = ref(false);
  const reloadFlag = ref(true);
  const reloading = ref(false);

  function toggleSider() {
    siderCollapse.value = !siderCollapse.value;
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
    siderCollapse,
    reloadFlag,
    reloading,
    toggleSider,
    reloadPage
  };
});
