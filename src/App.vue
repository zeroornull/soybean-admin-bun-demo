<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { NConfigProvider } from 'naive-ui';
import { useRoute } from 'vue-router';
import { naiveDateLocales, naiveLocales } from '@/locales/naive';
import { setDocumentTitle } from '@/locales';
import { useAppStore } from '@/store/app';

defineOptions({ name: 'App' });

const route = useRoute();
const appStore = useAppStore();
const naiveLocale = computed(() => naiveLocales[appStore.locale]);
const naiveDateLocale = computed(() => naiveDateLocales[appStore.locale]);

watchEffect(() => {
  appStore.locale;
  setDocumentTitle(route.meta);
});
</script>

<template>
  <NConfigProvider :locale="naiveLocale" :date-locale="naiveDateLocale">
    <RouterView />
  </NConfigProvider>
</template>
