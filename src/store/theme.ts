import { ref } from 'vue';
import { defineStore } from 'pinia';
import { SetupStoreId } from './ids';

/** Visual theme state; R14 will connect it to CSS variables and Naive UI. */
export const useThemeStore = defineStore(SetupStoreId.Theme, () => {
  const darkMode = ref(false);
  const themeColor = ref('#646cff');

  return {
    darkMode,
    themeColor
  };
});
