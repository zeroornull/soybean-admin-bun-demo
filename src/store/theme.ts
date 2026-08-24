import { computed, onScopeDispose, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { darkTheme } from 'naive-ui';
import type { GlobalThemeOverrides } from 'naive-ui';
import {
  clearThemeSettings,
  getThemeColorSetting,
  getThemeSchemeSetting,
  setThemeColorSetting,
  setThemeSchemeSetting
} from '@/utils/storage';
import { createThemeColorPalette, isHexColor, normalizeHexColor } from '@/utils/color';
import { SetupStoreId } from './ids';

export const themeSchemes = ['light', 'dark', 'auto'] as const;
export type ThemeScheme = (typeof themeSchemes)[number];
export const defaultThemeScheme: ThemeScheme = 'light';
export const defaultThemeColor = '#646cff';

export function resolveThemeScheme(value: unknown): ThemeScheme {
  return themeSchemes.includes(value as ThemeScheme) ? (value as ThemeScheme) : defaultThemeScheme;
}

/** Visual theme state and its DOM/Naive/storage projections. */
export const useThemeStore = defineStore(SetupStoreId.Theme, () => {
  const mediaQuery = typeof window === 'undefined' ? null : window.matchMedia('(prefers-color-scheme: dark)');
  const systemDark = ref(mediaQuery?.matches ?? false);
  const themeScheme = ref<ThemeScheme>(resolveThemeScheme(getThemeSchemeSetting()));
  const themeColor = ref(normalizeHexColor(getThemeColorSetting(), defaultThemeColor));
  const darkMode = computed(() => (themeScheme.value === 'auto' ? systemDark.value : themeScheme.value === 'dark'));
  const themeColorPalette = computed(() => createThemeColorPalette(themeColor.value));
  const naiveTheme = computed(() => (darkMode.value ? darkTheme : null));
  const themeOverrides = computed<GlobalThemeOverrides>(() => ({
    common: {
      ...themeColorPalette.value,
      bodyColor: 'var(--layout-bg)',
      cardColor: 'var(--card-bg)',
      textColorBase: 'var(--text-color)',
      borderColor: 'var(--border-color)'
    }
  }));

  function syncThemeToDom() {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('dark', darkMode.value);
    root.style.colorScheme = darkMode.value ? 'dark' : 'light';

    const palette = themeColorPalette.value;
    root.style.setProperty('--primary', palette.primaryColor);
    root.style.setProperty('--primary-hover', palette.primaryColorHover);
    root.style.setProperty('--primary-pressed', palette.primaryColorPressed);
    root.style.setProperty('--primary-suppl', palette.primaryColorSuppl);
  }

  watch(themeScheme, value => setThemeSchemeSetting(value), { flush: 'sync', immediate: true });
  watch(themeColor, value => setThemeColorSetting(value), { flush: 'sync', immediate: true });
  watch([darkMode, themeColorPalette], syncThemeToDom, { flush: 'sync', immediate: true });

  function handleSystemThemeChange(event: MediaQueryListEvent) {
    systemDark.value = event.matches;
  }

  mediaQuery?.addEventListener('change', handleSystemThemeChange);
  onScopeDispose(() => mediaQuery?.removeEventListener('change', handleSystemThemeChange));

  function setThemeScheme(scheme: ThemeScheme) {
    themeScheme.value = scheme;
  }

  function toggleThemeScheme() {
    const currentIndex = themeSchemes.indexOf(themeScheme.value);
    setThemeScheme(themeSchemes[(currentIndex + 1) % themeSchemes.length]);
  }

  function setThemeColor(color: string) {
    if (!isHexColor(color)) return false;

    themeColor.value = color.toLowerCase();
    return true;
  }

  function resetTheme() {
    themeScheme.value = defaultThemeScheme;
    themeColor.value = defaultThemeColor;
    clearThemeSettings();
    syncThemeToDom();
  }

  return {
    themeScheme,
    darkMode,
    themeColor,
    systemDark,
    themeColorPalette,
    naiveTheme,
    themeOverrides,
    setThemeScheme,
    toggleThemeScheme,
    setThemeColor,
    resetTheme
  };
});
