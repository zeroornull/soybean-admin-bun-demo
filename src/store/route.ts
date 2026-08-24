import { ref } from 'vue';
import { defineStore } from 'pinia';
import { SetupStoreId } from './ids';

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  children?: MenuItem[];
}

/** Visible route and menu projection state; R10/R11 will populate it. */
export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const menus = ref<MenuItem[]>([]);

  return {
    menus
  };
});
