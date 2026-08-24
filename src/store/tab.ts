import { ref } from 'vue';
import { defineStore } from 'pinia';
import { SetupStoreId } from './ids';

export interface TabItem {
  id: string;
  label: string;
  path: string;
}

/** Multi-tab state; R12 will add tab lifecycle actions. */
export const useTabStore = defineStore(SetupStoreId.Tab, () => {
  const tabs = ref<TabItem[]>([]);

  return {
    tabs
  };
});
