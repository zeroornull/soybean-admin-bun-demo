<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { resolveLocalIconHref } from '@/utils/svg-sprite';

defineOptions({ name: 'SvgIcon', inheritAttrs: false });

const props = defineProps<{
  localIcon?: string;
}>();

const attrs = useAttrs();
const href = computed(() => resolveLocalIconHref(props.localIcon));
</script>

<template>
  <svg
    aria-hidden="true"
    width="1em"
    height="1em"
    data-svg-icon
    :data-local-icon="props.localIcon || 'no-icon'"
    class="inline-block align-middle"
    v-bind="attrs"
  >
    <use :href="href" fill="currentColor" />
  </svg>
</template>
