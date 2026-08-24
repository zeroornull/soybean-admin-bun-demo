<script setup lang="ts">
defineOptions({ name: 'Forbidden' });
</script>

<template>
  <main data-page="forbidden" class="min-h-screen grid place-items-center bg-[var(--layout-bg)] p-24px">
    <section class="card-wrapper w-full max-w-480px bg-[var(--card-bg)] p-24px text-center">
      <p class="m-0 text-64px font-700">403</p>
      <h1 class="mb-0 mt-8px text-24px font-600">No permission</h1>
      <RouterLink
        data-nav="home"
        class="mt-20px inline-block rd-8px bg-primary px-12px py-8px text-white transition-opacity hover:(opacity-90)"
        to="/home"
      >
        Back home
      </RouterLink>
    </section>
  </main>
</template>
