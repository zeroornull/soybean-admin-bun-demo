<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { NConfigProvider, NGlobalStyle } from 'naive-ui';
import { useRoute } from 'vue-router';
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

watchEffect(() => {
  appStore.locale;
  setDocumentTitle(route.meta);
});
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
  </NConfigProvider>
</template>
