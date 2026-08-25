<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/store/app';
import { useThemeStore } from '@/store/theme';
import { provideLayoutShell } from './use-layout-shell';
import LayoutContent from './modules/content.vue';
import LayoutHeader from './modules/header.vue';
import LayoutSider from './modules/sider.vue';
import LayoutTabs from './modules/tabs.vue';

defineOptions({ name: 'BaseLayout' });

const appStore = useAppStore();
const themeStore = useThemeStore();
const { t } = useI18n();
const { chrome } = provideLayoutShell();
</script>

<template>
  <div
    data-layout="base"
    :data-layout-mode="themeStore.layoutMode"
    :data-sider-collapsed="appStore.siderCollapse"
    class="h-screen flex overflow-hidden bg-[var(--layout-bg)] text-[var(--text-color)]"
    :class="chrome.showSider ? 'flex-row' : 'flex-col'"
  >
    <LayoutSider v-if="chrome.showSider" :collapsed="appStore.siderCollapse" />

    <section data-layout-main class="min-w-0 flex flex-1 flex-col">
      <LayoutHeader :collapsed="appStore.siderCollapse" @toggle-sider="appStore.toggleSider" />
      <LayoutTabs v-if="themeStore.extras.blocks.tabs" />
      <LayoutContent />
      <footer
        v-if="themeStore.extras.blocks.footer"
        data-layout-footer
        class="h-40px shrink-0 flex items-center justify-center border-t border-[var(--border-color)] bg-[var(--card-bg)] text-13px opacity-80"
      >
        {{ t('common.appName') }}
      </footer>
    </section>
  </div>
</template>
