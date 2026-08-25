import { computed, onScopeDispose, ref, watch } from 'vue';
import { defineStore } from 'pinia';
import { darkTheme } from 'naive-ui';
import type { GlobalThemeOverrides } from 'naive-ui';
import dayjs from 'dayjs';
import { defaultLayoutMode, resolveLayoutMode, type LayoutMode } from '@/layouts/layout-mode';
import { resolveTabMode, type TabMode } from '@/store/tab-shared';
import {
  clampThemeRadius,
  defaultThemeExtras,
  getThemePreset,
  parseThemeExtras,
  resolveWatermarkContent,
  type ThemeBlocks,
  type ThemeExtras,
  type ThemeWatermark
} from '@/theme/settings';
import {
  clearThemeSettings,
  getLayoutModeSetting,
  getThemeColorSetting,
  getThemeExtrasSetting,
  getThemeSchemeSetting,
  removeGlobalTabsSetting,
  setLayoutModeSetting,
  setThemeColorSetting,
  setThemeExtrasSetting,
  setThemeSchemeSetting
} from '@/utils/storage';
import { createThemeColorPalette, isHexColor, normalizeHexColor } from '@sa/color';
import { useAuthStore } from './auth';
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
  const layoutMode = ref<LayoutMode>(resolveLayoutMode(getLayoutModeSetting()));
  const extras = ref<ThemeExtras>(parseThemeExtras(getThemeExtrasSetting()));
  const watermarkNow = ref(Date.now());
  const darkMode = computed(() => (themeScheme.value === 'auto' ? systemDark.value : themeScheme.value === 'dark'));
  const themeColorPalette = computed(() => createThemeColorPalette(themeColor.value));
  const naiveTheme = computed(() => (darkMode.value ? darkTheme : null));
  const themeOverrides = computed<GlobalThemeOverrides>(() => ({
    common: {
      ...themeColorPalette.value,
      borderRadius: `${extras.value.radius}px`,
      bodyColor: 'var(--layout-bg)',
      cardColor: 'var(--card-bg)',
      textColorBase: 'var(--text-color)',
      borderColor: 'var(--border-color)'
    }
  }));
  const watermarkContent = computed(() =>
    resolveWatermarkContent(
      extras.value.watermark,
      useAuthStore().userInfo?.userName,
      dayjs(watermarkNow.value).format('YYYY-MM-DD HH:mm:ss')
    )
  );

  let watermarkTimer: ReturnType<typeof setInterval> | undefined;

  function syncThemeToDom() {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.toggle('dark', darkMode.value);
    root.style.colorScheme = darkMode.value ? 'dark' : 'light';
    root.style.filter = [
      extras.value.grayscale ? 'grayscale(100%)' : '',
      extras.value.colourWeakness ? 'invert(80%)' : ''
    ]
      .filter(Boolean)
      .join(' ');
    if (!extras.value.grayscale && !extras.value.colourWeakness) root.style.removeProperty('filter');

    const palette = themeColorPalette.value;
    root.style.setProperty('--primary', palette.primaryColor);
    root.style.setProperty('--primary-hover', palette.primaryColorHover);
    root.style.setProperty('--primary-pressed', palette.primaryColorPressed);
    root.style.setProperty('--primary-suppl', palette.primaryColorSuppl);
    root.style.setProperty('--theme-radius', `${extras.value.radius}px`);
    root.dataset.themeRadius = String(extras.value.radius);
  }

  watch(themeScheme, value => setThemeSchemeSetting(value), { flush: 'sync', immediate: true });
  watch(themeColor, value => setThemeColorSetting(value), { flush: 'sync', immediate: true });
  watch(layoutMode, value => setLayoutModeSetting(value), { flush: 'sync', immediate: true });
  watch(extras, value => setThemeExtrasSetting(JSON.stringify(value)), { deep: true, flush: 'sync', immediate: true });
  watch([darkMode, themeColorPalette, extras], syncThemeToDom, { deep: true, flush: 'sync', immediate: true });
  watch(
    () => extras.value.watermark.visible && extras.value.watermark.enableTime,
    run => {
      if (watermarkTimer) {
        clearInterval(watermarkTimer);
        watermarkTimer = undefined;
      }

      if (!run) return;

      watermarkNow.value = Date.now();
      watermarkTimer = setInterval(() => {
        watermarkNow.value = Date.now();
      }, 1000);
    },
    { immediate: true }
  );

  function handleSystemThemeChange(event: MediaQueryListEvent) {
    systemDark.value = event.matches;
  }

  mediaQuery?.addEventListener('change', handleSystemThemeChange);
  onScopeDispose(() => {
    mediaQuery?.removeEventListener('change', handleSystemThemeChange);
    if (watermarkTimer) clearInterval(watermarkTimer);
  });

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

  function setLayoutMode(mode: LayoutMode) {
    layoutMode.value = resolveLayoutMode(mode);
  }

  function setThemeRadius(radius: number) {
    extras.value.radius = clampThemeRadius(radius);
  }

  function setGrayscale(enabled: boolean) {
    extras.value.grayscale = enabled;
  }

  function setColourWeakness(enabled: boolean) {
    extras.value.colourWeakness = enabled;
  }

  function setBlockVisible(block: keyof ThemeBlocks, visible: boolean) {
    extras.value.blocks[block] = visible;
  }

  function setTabMode(mode: TabMode) {
    extras.value.tabMode = resolveTabMode(mode);
  }

  function setTabCache(enabled: boolean) {
    extras.value.tabCache = enabled;
    if (!enabled) removeGlobalTabsSetting();
  }

  function setCloseTabByMiddleClick(enabled: boolean) {
    extras.value.closeTabByMiddleClick = enabled;
  }

  function patchWatermark(patch: Partial<ThemeWatermark>) {
    const next = { ...extras.value.watermark, ...patch };

    if (patch.enableUserName) next.enableTime = false;
    if (patch.enableTime) next.enableUserName = false;

    extras.value.watermark = next;
  }

  function applyPreset(id: string) {
    const preset = getThemePreset(id);
    if (!preset) return false;

    themeScheme.value = preset.themeScheme;
    themeColor.value = preset.themeColor;
    layoutMode.value = preset.layoutMode;
    extras.value = JSON.parse(JSON.stringify(preset.extras)) as ThemeExtras;
    return true;
  }

  function resetTheme() {
    themeScheme.value = defaultThemeScheme;
    themeColor.value = defaultThemeColor;
    layoutMode.value = defaultLayoutMode;
    extras.value = JSON.parse(JSON.stringify(defaultThemeExtras)) as ThemeExtras;
    clearThemeSettings();
    syncThemeToDom();
  }

  return {
    themeScheme,
    darkMode,
    themeColor,
    layoutMode,
    extras,
    systemDark,
    themeColorPalette,
    naiveTheme,
    themeOverrides,
    watermarkContent,
    setThemeScheme,
    toggleThemeScheme,
    setThemeColor,
    setLayoutMode,
    setThemeRadius,
    setGrayscale,
    setColourWeakness,
    setBlockVisible,
    setTabMode,
    setTabCache,
    setCloseTabByMiddleClick,
    patchWatermark,
    applyPreset,
    resetTheme
  };
});
