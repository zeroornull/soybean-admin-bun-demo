<script setup lang="ts">
import { ref } from 'vue';
import LayoutContent from './modules/content.vue';
import LayoutHeader from './modules/header.vue';
import LayoutSider from './modules/sider.vue';

defineOptions({ name: 'BaseLayout' });

const siderCollapsed = ref(false);

function toggleSider() {
  siderCollapsed.value = !siderCollapsed.value;
}
</script>

<template>
  <div
    data-layout="base"
    :data-sider-collapsed="siderCollapsed"
    class="h-screen flex overflow-hidden bg-[var(--layout-bg)] text-[var(--text-color)]"
  >
    <LayoutSider :collapsed="siderCollapsed" />

    <section data-layout-main class="min-w-0 flex flex-1 flex-col">
      <LayoutHeader :collapsed="siderCollapsed" @toggle-sider="toggleSider" />
      <LayoutContent />
    </section>
  </div>
</template>
