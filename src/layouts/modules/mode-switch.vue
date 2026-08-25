<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { layoutModes, type LayoutMode } from '@/layouts/layout-mode';
import { useThemeStore } from '@/store/theme';

defineOptions({ name: 'LayoutModeSwitch' });

const themeStore = useThemeStore();
const { t } = useI18n();

function handleChange(event: Event) {
  themeStore.setLayoutMode((event.target as HTMLSelectElement).value as LayoutMode);
}
</script>

<template>
  <label class="min-w-0 max-w-180px flex items-center" :title="t('layout.switchMode')">
    <span class="sr-only">{{ t('layout.switchMode') }}</span>
    <select
      data-layout-mode-switch
      class="h-34px max-w-full rd-8px border border-[var(--border-color)] bg-transparent px-8px text-13px text-[var(--text-color)]"
      :aria-label="t('layout.switchMode')"
      :value="themeStore.layoutMode"
      @change="handleChange"
    >
      <option v-for="mode in layoutModes" :key="mode" :value="mode">
        {{ t(`layout.mode.${mode}`) }}
      </option>
    </select>
  </label>
</template>
