<script setup lang="ts">
import { useAppStore } from '@/store/app';
import { useTabStore } from '@/store/tab';

defineOptions({ name: 'LayoutContent' });

const appStore = useAppStore();
const tabStore = useTabStore();
</script>

<template>
  <main
    data-layout-content
    :data-cache-names="tabStore.cacheNames.join(',')"
    :data-reloading="appStore.reloading"
    class="min-h-0 flex-1 overflow-auto p-20px max-sm:p-12px"
  >
    <RouterView v-slot="{ Component, route }">
      <KeepAlive :include="tabStore.cacheNames">
        <component :is="Component" v-if="appStore.reloadFlag" :key="String(route.name || route.path)" />
      </KeepAlive>
    </RouterView>
  </main>
</template>
