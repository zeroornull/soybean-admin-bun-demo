<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useThemeStore, type ThemeScheme } from '@/store/theme';

defineOptions({ name: 'ThemeControls' });

const themeStore = useThemeStore();
const { t } = useI18n();
const schemeIcons: Record<ThemeScheme, string> = {
  light: '☀',
  dark: '☾',
  auto: 'A'
};
const schemeLabels = computed<Record<ThemeScheme, string>>(() => ({
  light: t('theme.light'),
  dark: t('theme.dark'),
  auto: t('theme.auto')
}));

function handleColorInput(event: Event) {
  themeStore.setThemeColor((event.target as HTMLInputElement).value);
}
</script>

<template>
  <div data-theme-controls class="shrink-0 flex items-center gap-5px">
    <button
      data-theme-action="scheme"
      :data-theme-scheme="themeStore.themeScheme"
      :data-dark-mode="themeStore.darkMode"
      class="size-34px rd-8px border border-[var(--border-color)] bg-transparent"
      type="button"
      :aria-label="t('theme.switchScheme', { scheme: schemeLabels[themeStore.themeScheme] })"
      :title="t('theme.switchScheme', { scheme: schemeLabels[themeStore.themeScheme] })"
      @click="themeStore.toggleThemeScheme"
    >
      {{ schemeIcons[themeStore.themeScheme] }}
    </button>
    <label
      class="size-34px cursor-pointer rd-8px border border-[var(--border-color)] bg-transparent p-3px max-sm:hidden"
      :title="t('theme.themeColor')"
    >
      <span class="sr-only">{{ t('theme.themeColor') }}</span>
      <input
        id="theme-color-picker"
        data-theme-action="color"
        class="size-full cursor-pointer border-0 bg-transparent p-0"
        name="themeColor"
        type="color"
        :aria-label="t('theme.themeColor')"
        :value="themeStore.themeColor"
        @input="handleColorInput"
      />
    </label>
    <button
      data-theme-action="reset"
      class="size-34px rd-8px border border-[var(--border-color)] bg-transparent max-sm:hidden"
      type="button"
      :aria-label="t('theme.reset')"
      :title="t('theme.reset')"
      @click="themeStore.resetTheme"
    >
      ↺
    </button>
  </div>
</template>
