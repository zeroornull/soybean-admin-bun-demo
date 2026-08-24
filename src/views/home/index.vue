<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { NButton, NDatePicker } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { dayjs } from '@/locales/dayjs';
import { useThemeStore } from '@/store/theme';

defineOptions({ name: 'Home' });

const localCount = ref(0);
const selectedDate = ref<number | null>(null);
const datePickerRef = ref<InstanceType<typeof NDatePicker> | null>(null);
const { t, locale } = useI18n();
const themeStore = useThemeStore();
const localizedDate = computed(() => {
  locale.value;
  return dayjs('2026-08-24').format('MMMM dddd');
});
const currentThemeSchemeLabel = computed(() => t(`theme.${themeStore.themeScheme}`));

onMounted(() => {
  const input = (datePickerRef.value?.$el as HTMLElement | undefined)?.querySelector('input');
  input?.setAttribute('id', 'locale-date-picker');
  input?.setAttribute('name', 'localeDate');
});
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
          <NDatePicker
            ref="datePickerRef"
            v-model:value="selectedDate"
            data-naive-locale-demo
            type="date"
            clearable
          />
        </label>
      </div>

      <div class="mt-12px flex flex-wrap items-center justify-between gap-10px rd-8px bg-[var(--layout-bg)] p-12px">
        <p data-theme-summary class="m-0 text-13px">
          {{ t('theme.currentTheme', { scheme: currentThemeSchemeLabel, color: themeStore.themeColor }) }}
        </p>
        <NButton data-naive-primary type="primary">{{ t('theme.primaryAction') }}</NButton>
      </div>

      <div class="mt-20px flex flex-wrap justify-center gap-12px">
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
