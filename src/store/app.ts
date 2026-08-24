import { ref } from 'vue';
import { defineStore } from 'pinia';
import { SetupStoreId } from './ids';

/** Global application shell state. */
export const useAppStore = defineStore(SetupStoreId.App, () => {
  const siderCollapse = ref(false);

  function toggleSider() {
    siderCollapse.value = !siderCollapse.value;
  }

  return {
    siderCollapse,
    toggleSider
  };
});
