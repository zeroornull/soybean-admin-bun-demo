<script setup lang="ts">
import { computed, watch } from 'vue';
import { NAlert, NButton, NConfigProvider, NGlobalStyle, NWatermark } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import ThemeDrawer from '@/layouts/modules/theme-drawer.vue';
import { naiveDateLocales, naiveLocales } from '@/locales/naive';
import { setDocumentTitle } from '@/locales';
import { useAppStore } from '@/store/app';
import { useThemeStore } from '@/store/theme';

defineOptions({ name: 'App' });

const route = useRoute();
const { t } = useI18n();
const appStore = useAppStore();
const themeStore = useThemeStore();
const naiveLocale = computed(() => naiveLocales[appStore.locale]);
const naiveDateLocale = computed(() => naiveDateLocales[appStore.locale]);

watch([() => appStore.locale, () => route.meta], ([, meta]) => setDocumentTitle(meta), { immediate: true });

function reloadApp() {
  window.location.reload();
}
</script>

<template>
  <NConfigProvider
    :locale="naiveLocale"
    :date-locale="naiveDateLocale"
    :theme="themeStore.naiveTheme"
    :theme-overrides="themeStore.themeOverrides"
  >
    <NGlobalStyle />
    <div
      v-if="appStore.updateAvailable"
      data-app-update
      class="fixed right-16px top-16px z-[10000] w-360px max-w-[calc(100vw-32px)]"
    >
      <NAlert type="info" :title="t('system.updateTitle')" closable @close="appStore.dismissUpdate()">
        <p class="m-0">{{ t('system.updateContent') }}</p>
        <div class="mt-10px flex justify-end gap-8px">
          <NButton data-app-update-action="later" size="small" @click="appStore.dismissUpdate()">
            {{ t('system.updateCancel') }}
          </NButton>
          <NButton data-app-update-action="reload" size="small" type="primary" @click="reloadApp">
            {{ t('system.updateConfirm') }}
          </NButton>
        </div>
      </NAlert>
    </div>
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
