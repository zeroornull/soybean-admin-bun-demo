<script setup lang="ts">
defineOptions({ name: 'Login' });
</script>

<template>
  <main data-page="login" class="min-h-screen grid place-items-center p-24px">
    <section class="card-wrapper w-full max-w-420px bg-[var(--card-bg)] p-24px text-center">
      <h1 class="m-0 text-28px font-600">Login</h1>
      <p class="mb-0 mt-8px">The login form will be implemented in R09 and polished in R15.</p>
      <RouterLink
        data-nav="home"
        class="mt-20px inline-block rd-8px bg-primary px-12px py-8px text-white transition-opacity hover:(opacity-90)"
        to="/home"
      >
        Go home
      </RouterLink>
    </section>
  </main>
</template>
