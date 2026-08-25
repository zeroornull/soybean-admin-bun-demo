<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

defineOptions({ name: 'Restricted' });

const localCount = ref(0);
const { t } = useI18n();
</script>

<template>
  <div data-page="restricted" data-demo="static-permission" class="min-h-full grid place-items-center p-24px">
    <section class="card-wrapper w-full max-w-520px bg-[var(--card-bg)] p-24px text-center">
      <p class="m-0 text-12px font-700 tracking-1px text-primary">{{ t('restricted.demoNote') }}</p>
      <h1 class="mb-0 mt-10px text-28px font-600">{{ t('restricted.title') }}</h1>
      <p class="mb-0 mt-8px">{{ t('restricted.description') }}</p>
      <button
        data-local-counter="restricted"
        class="mt-20px rd-8px border border-[var(--border-color)] bg-transparent px-12px py-8px transition-opacity hover:(opacity-80)"
        type="button"
        @click="localCount += 1"
      >
        {{ t('common.localState', { count: localCount }) }}
      </button>
      <RouterLink
        data-nav="home"
        class="mt-20px inline-block rd-8px bg-primary px-12px py-8px text-white transition-opacity hover:(opacity-90)"
        to="/home"
      >
        {{ t('common.backHome') }}
      </RouterLink>
    </section>
  </div>
</template>
