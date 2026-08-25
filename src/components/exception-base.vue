<script setup lang="ts">
import { computed } from 'vue';
import { NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import LocaleSwitch from '@/components/locale-switch.vue';
import ThemeControls from '@/components/theme-controls.vue';

defineOptions({ name: 'ExceptionBase' });

export interface ExceptionAction {
  labelKey: string;
}

const props = defineProps<{
  code: 403 | 404 | 500;
  titleKey: string;
  descriptionKey: string;
  illustration: 'permission' | 'not-found' | 'server';
  primaryAction: ExceptionAction;
  secondaryAction?: ExceptionAction;
}>();

const emit = defineEmits<{
  primary: [];
  secondary: [];
}>();

const { t } = useI18n();
const pageName = computed(() => {
  const names = {
    403: 'forbidden',
    404: 'not-found',
    500: 'server-error'
  } as const;

  return names[props.code];
});
</script>

<template>
  <main
    :data-page="pageName"
    :data-exception-code="props.code"
    class="min-h-screen grid place-items-center overflow-hidden bg-[var(--layout-bg)] p-20px sm:p-32px"
  >
    <section
      class="relative grid w-full max-w-920px items-center gap-20px overflow-hidden rd-18px border border-[var(--border-color)] bg-[var(--card-bg)] p-24px shadow-[0_28px_90px_rgba(15,23,42,0.12)] md:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)] md:p-44px"
    >
      <div
        data-exception-illustration
        aria-hidden="true"
        class="mx-auto w-full max-w-300px text-primary"
      >
        <svg viewBox="0 0 240 180" class="block h-auto w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="120" cy="90" r="76" fill="currentColor" opacity="0.08" />
          <circle cx="120" cy="90" r="54" fill="currentColor" opacity="0.10" />

          <g v-if="props.illustration === 'permission'" stroke="currentColor" stroke-width="8">
            <rect x="78" y="82" width="84" height="62" rx="13" fill="currentColor" opacity="0.16" />
            <path d="M94 82V65C94 48 105 37 120 37C135 37 146 48 146 65V82" />
            <circle cx="120" cy="111" r="8" fill="currentColor" />
          </g>

          <g v-else-if="props.illustration === 'not-found'" stroke="currentColor" stroke-width="8">
            <circle cx="104" cy="77" r="38" fill="currentColor" opacity="0.14" />
            <path d="M132 105L166 139" stroke-linecap="round" />
            <path d="M92 67H116M104 55V79" stroke-linecap="round" opacity="0.8" />
          </g>

          <g v-else stroke="currentColor" stroke-width="7">
            <rect x="66" y="45" width="108" height="34" rx="8" fill="currentColor" opacity="0.14" />
            <rect x="66" y="91" width="108" height="34" rx="8" fill="currentColor" opacity="0.18" />
            <circle cx="86" cy="62" r="4" fill="currentColor" />
            <circle cx="86" cy="108" r="4" fill="currentColor" />
            <path d="M102 62H154M102 108H154" stroke-linecap="round" opacity="0.75" />
            <path d="M106 141L120 155L140 133" stroke-linecap="round" stroke-linejoin="round" />
          </g>
        </svg>
      </div>

      <div class="min-w-0 text-center md:text-left">
        <p class="m-0 text-14px font-800 tracking-3px text-primary">ERROR {{ props.code }}</p>
        <h1 class="mb-0 mt-10px text-30px font-750 sm:text-36px">{{ t(props.titleKey) }}</h1>
        <p class="mb-0 mt-12px text-14px leading-24px opacity-68 sm:text-15px">
          {{ t(props.descriptionKey) }}
        </p>

        <div class="mt-26px flex flex-wrap justify-center gap-10px md:justify-start">
          <NButton data-exception-action="primary" type="primary" size="large" @click="emit('primary')">
            {{ t(props.primaryAction.labelKey) }}
          </NButton>
          <NButton
            v-if="props.secondaryAction"
            data-exception-action="secondary"
            size="large"
            @click="emit('secondary')"
          >
            {{ t(props.secondaryAction.labelKey) }}
          </NButton>
        </div>
      </div>
    </section>

    <div class="fixed right-16px top-16px flex items-center gap-6px">
      <ThemeControls />
      <LocaleSwitch />
    </div>
  </main>
</template>
