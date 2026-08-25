<script setup lang="ts">
import { computed, watch } from 'vue';
import { NConfigProvider, NGlobalStyle, NWatermark } from 'naive-ui';
import { useRoute } from 'vue-router';
import ThemeDrawer from '@/layouts/modules/theme-drawer.vue';
import { naiveDateLocales, naiveLocales } from '@/locales/naive';
import { setDocumentTitle } from '@/locales';
import { useAppStore } from '@/store/app';
import { useThemeStore } from '@/store/theme';

defineOptions({ name: 'App' });

const route = useRoute();
const appStore = useAppStore();
const themeStore = useThemeStore();
const naiveLocale = computed(() => naiveLocales[appStore.locale]);
const naiveDateLocale = computed(() => naiveDateLocales[appStore.locale]);

watch([() => appStore.locale, () => route.meta], ([, meta]) => setDocumentTitle(meta), { immediate: true });
</script>

<template>
  <NConfigProvider
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    :theme="themeStore.naiveTheme"
    :theme-overrides="themeStore.themeOverrides"
  >
    <NGlobalStyle />
    <RouterView />
    <NWatermark
      v-if="themeStore.extras.watermark.visible"
      data-watermark
      :content="themeStore.watermarkContent"
      cross
      fullscreen
      :font-size="16"
      :z-index="9999"
    />
    <ThemeDrawer />
  </NConfigProvider>
</template>
