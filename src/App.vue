<script setup lang="ts">
defineOptions({ name: 'App' });

function setDarkMode(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
}
</script>

<template>
  <main
    id="app-container"
    class="min-h-screen grid place-items-center bg-[var(--layout-bg)] p-24px text-[var(--text-color)] transition-colors duration-200"
  >
    <section
      data-theme-panel
      class="card-wrapper w-full max-w-560px bg-[var(--card-bg)] p-24px text-center transition-colors duration-200"
    >
      <h1 class="m-0 text-28px font-600">Soybean Admin</h1>
      <p class="mb-0 mt-8px">UnoCSS and theme variables are ready.</p>

      <div class="mt-20px flex justify-center gap-12px">
        <button
          data-theme-action="light"
          class="rd-8px border border-[var(--border-color)] bg-transparent px-12px py-8px transition-opacity hover:(opacity-80)"
          type="button"
          @click="setDarkMode(false)"
        >
          Light
        </button>
        <button
          data-theme-action="dark"
          class="rd-8px bg-primary px-12px py-8px text-white transition-opacity hover:(opacity-90)"
          type="button"
          @click="setDarkMode(true)"
        >
          Dark
        </button>
      </div>
    </section>
  </main>
</template>
