<script setup lang="ts">
import { computed } from 'vue';
import { NAlert, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { defaultIframeSrc, resolveIframeSrc } from './src';

defineOptions({ name: 'IframePage' });

const props = defineProps<{
  url?: string;
}>();

const router = useRouter();
const { t } = useI18n();
const src = computed(() => resolveIframeSrc(props.url));

function openEncodedDemo() {
  return router.replace({
    name: 'iframe-page',
    params: { url: defaultIframeSrc }
  });
}
</script>

<template>
  <section data-page="iframe" class="h-[calc(100vh-148px)] min-h-420px flex flex-col gap-12px">
    <header class="flex flex-wrap items-center justify-between gap-8px">
      <div>
        <h1 class="m-0 text-22px font-700">{{ t('iframe.title') }}</h1>
        <p class="mb-0 mt-4px text-13px opacity-68">{{ t('iframe.description') }}</p>
      </div>
      <NButton data-iframe-action="encoded" size="small" secondary @click="openEncodedDemo">
        {{ t('iframe.openEncoded') }}
      </NButton>
    </header>

    <NAlert v-if="!src" data-iframe-invalid type="warning">
      {{ t('iframe.invalidUrl') }}
    </NAlert>
    <iframe
      v-else
      data-iframe
      class="min-h-0 w-full flex-1 rd-8px border border-[var(--border-color)] bg-[var(--card-bg)]"
      :src="src"
      :title="t('iframe.title')"
      :data-iframe-src="src"
    />
  </section>
</template>
