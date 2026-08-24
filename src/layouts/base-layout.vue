<script setup lang="ts">
import { useAppStore } from '@/store';
import LayoutContent from './modules/content.vue';
import LayoutHeader from './modules/header.vue';
import LayoutSider from './modules/sider.vue';

defineOptions({ name: 'BaseLayout' });

const appStore = useAppStore();
</script>

<template>
  <div
    data-layout="base"
    :data-sider-collapsed="appStore.siderCollapse"
    class="h-screen flex overflow-hidden bg-[var(--layout-bg)] text-[var(--text-color)]"
  >
    <LayoutSider :collapsed="appStore.siderCollapse" />

    <section data-layout-main class="min-w-0 flex flex-1 flex-col">
      <LayoutHeader :collapsed="appStore.siderCollapse" @toggle-sider="appStore.toggleSider" />
      <LayoutContent />
    </section>
  </div>
</template>
