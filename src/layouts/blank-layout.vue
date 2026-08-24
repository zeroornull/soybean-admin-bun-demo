<script setup lang="ts">
defineOptions({ name: 'BlankLayout' });
</script>

<template>
  <div data-layout="blank" class="min-h-screen bg-[var(--layout-bg)] text-[var(--text-color)]">
    <RouterView />
  </div>
</template>
