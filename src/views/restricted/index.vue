<script setup lang="ts">
defineOptions({ name: 'Restricted' });
</script>

<template>
  <div data-page="restricted" class="min-h-full grid place-items-center p-24px">
    <section class="card-wrapper w-full max-w-520px bg-[var(--card-bg)] p-24px text-center">
      <h1 class="m-0 text-28px font-600">Restricted route</h1>
      <p class="mb-0 mt-8px">Only the static super role can bypass this route's R_NOBODY requirement.</p>
      <RouterLink
        data-nav="home"
        class="mt-20px inline-block rd-8px bg-primary px-12px py-8px text-white transition-opacity hover:(opacity-90)"
        to="/home"
      >
        Back home
      </RouterLink>
    </section>
  </div>
</template>
