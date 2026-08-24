<script setup lang="ts">
defineOptions({ name: 'BaseLayout' });
</script>

<template>
  <div data-layout="base" class="min-h-screen flex bg-[var(--layout-bg)] text-[var(--text-color)]">
    <aside
      data-layout-sider
      class="w-220px border-r border-[var(--border-color)] bg-[var(--card-bg)] p-20px transition-colors duration-200"
    >
      <strong class="text-18px">Soybean Admin</strong>
      <p class="mb-0 mt-8px text-14px opacity-70">Base layout placeholder</p>
    </aside>

    <main class="min-w-0 flex-1">
      <RouterView />
    </main>
  </div>
</template>
