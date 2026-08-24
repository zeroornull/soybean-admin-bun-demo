<script setup lang="ts">
defineOptions({ name: 'LayoutContent' });
</script>

<template>
  <main data-layout-content class="min-h-0 flex-1 overflow-auto p-20px max-sm:p-12px">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </main>
</template>
