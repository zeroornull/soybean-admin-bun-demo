<script setup lang="ts">
import { computed, ref } from 'vue';
import { NDatePicker } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { dayjs } from '@/locales/dayjs';

defineOptions({ name: 'Home' });

const localCount = ref(0);
const selectedDate = ref<number | null>(null);
const { t, locale } = useI18n();
const localizedDate = computed(() => {
  locale.value;
  return dayjs('2026-08-24').format('MMMM dddd');
});

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
      <h1 class="m-0 text-28px font-600">{{ t('home.title') }}</h1>
      <p class="mb-0 mt-8px">{{ t('home.description') }}</p>

      <div class="mt-18px rd-8px bg-[var(--layout-bg)] p-12px text-left">
        <h2 class="m-0 text-15px font-600">{{ t('home.localeDemo') }}</h2>
        <p data-dayjs-locale class="mb-10px mt-6px text-13px">
          {{ t('home.dateLabel') }}：{{ localizedDate }}
        </p>
        <label class="flex flex-col gap-6px text-13px">
          <span>{{ t('home.datePickerLabel') }}</span>
          <NDatePicker v-model:value="selectedDate" data-naive-locale-demo type="date" clearable />
        </label>
      </div>

      <div class="mt-20px flex flex-wrap justify-center gap-12px">
        <button
          data-theme-action="light"
          class="rd-8px border border-[var(--border-color)] bg-transparent px-12px py-8px transition-opacity hover:(opacity-80)"
          type="button"
          @click="setDarkMode(false)"
        >
          {{ t('common.light') }}
        </button>
        <button
          data-theme-action="dark"
          class="rd-8px bg-primary px-12px py-8px text-white transition-opacity hover:(opacity-90)"
          type="button"
          @click="setDarkMode(true)"
        >
          {{ t('common.dark') }}
        </button>
        <button
          data-local-counter="home"
          class="rd-8px border border-[var(--border-color)] bg-transparent px-12px py-8px transition-opacity hover:(opacity-80)"
          type="button"
          @click="localCount += 1"
        >
          {{ t('common.localState', { count: localCount }) }}
        </button>
        <RouterLink
          data-nav="login"
          class="rd-8px border border-[var(--border-color)] px-12px py-8px transition-opacity hover:(opacity-80)"
          to="/login"
        >
          {{ t('common.openLogin') }}
        </RouterLink>
      </div>
    </section>
  </div>
</template>
