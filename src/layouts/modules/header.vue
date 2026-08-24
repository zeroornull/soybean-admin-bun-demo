<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({ name: 'LayoutHeader' });

const props = defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggleSider: [];
}>();

const route = useRoute();
const pageTitle = computed(() => String(route.meta.title ?? route.name ?? 'Soybean Admin'));
</script>

<template>
  <header
    data-layout-header
    class="h-56px shrink-0 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-bg)] px-16px transition-colors duration-200"
  >
    <div class="min-w-0 flex items-center gap-12px">
      <button
        data-layout-action="toggle-sider"
        class="size-36px shrink-0 rd-8px border border-[var(--border-color)] bg-transparent transition-opacity hover:(opacity-80)"
        type="button"
        :aria-label="props.collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="emit('toggleSider')"
      >
        {{ props.collapsed ? '→' : '←' }}
      </button>
      <strong data-layout-title class="truncate text-16px">{{ pageTitle }}</strong>
    </div>

    <span class="text-13px opacity-60 max-sm:hidden">Vertical layout</span>
  </header>
</template>
