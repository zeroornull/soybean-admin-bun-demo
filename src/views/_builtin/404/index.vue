<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import LocaleSwitch from '@/components/locale-switch.vue';
import ThemeControls from '@/components/theme-controls.vue';

defineOptions({ name: 'NotFound' });

const { t } = useI18n();
</script>

<template>
  <main data-page="not-found" class="min-h-screen grid place-items-center bg-[var(--layout-bg)] p-24px">
    <div class="fixed right-16px top-16px flex items-center gap-6px">
      <ThemeControls />
      <LocaleSwitch />
    </div>
    <section class="card-wrapper w-full max-w-480px bg-[var(--card-bg)] p-24px text-center">
      <p class="m-0 text-64px font-700">404</p>
      <h1 class="mb-0 mt-8px text-24px font-600">{{ t('error.notFound') }}</h1>
      <RouterLink
        data-nav="home"
        class="mt-20px inline-block rd-8px bg-primary px-12px py-8px text-white transition-opacity hover:(opacity-90)"
        to="/home"
      >
        {{ t('common.backHome') }}
      </RouterLink>
    </section>
  </main>
</template>
