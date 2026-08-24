<script setup lang="ts">
import { ref } from 'vue';

defineOptions({ name: 'Home' });

const localCount = ref(0);

function setDarkMode(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark);
}
</script>

<template>
  <div data-page="home" class="min-h-full grid place-items-center p-24px max-sm:p-12px">
    <section
      data-theme-panel
      class="card-wrapper w-full max-w-560px bg-[var(--card-bg)] p-24px text-center transition-colors duration-200"
    >
      <h1 class="m-0 text-28px font-600">Home</h1>
      <p class="mb-0 mt-8px">The authenticated page currently uses the base layout.</p>

      <div class="mt-20px flex flex-wrap justify-center gap-12px">
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
        <button
          data-local-counter="home"
          class="rd-8px border border-[var(--border-color)] bg-transparent px-12px py-8px transition-opacity hover:(opacity-80)"
          type="button"
          @click="localCount += 1"
        >
          Local state: {{ localCount }}
        </button>
        <RouterLink
          data-nav="login"
          class="rd-8px border border-[var(--border-color)] px-12px py-8px transition-opacity hover:(opacity-80)"
          to="/login"
        >
          Open login
        </RouterLink>
      </div>
    </section>
  </div>
</template>
