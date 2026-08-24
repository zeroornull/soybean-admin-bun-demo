<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/store/app';

defineOptions({ name: 'LocaleSwitch' });

const appStore = useAppStore();
const { t } = useI18n();
const nextLocaleLabel = computed(() => (appStore.locale === 'zh-CN' ? 'EN' : '中'));
</script>

<template>
  <button
    data-locale-action="toggle"
    :data-locale="appStore.locale"
    class="h-34px min-w-38px rd-8px border border-[var(--border-color)] bg-transparent px-8px text-13px transition-opacity hover:opacity-80"
    type="button"
    :aria-label="t('common.switchLanguage')"
    :title="t('common.switchLanguage')"
    @click="appStore.toggleLocale"
  >
    {{ nextLocaleLabel }}
  </button>
</template>
