<script setup lang="ts">
import { useRoute } from 'vue-router';

defineOptions({ name: 'LayoutSider' });

const props = defineProps<{
  collapsed: boolean;
}>();

const route = useRoute();

const items = [
  { to: '/home', label: 'Home', shortLabel: 'H' },
  { to: '/login', label: 'Login', shortLabel: 'L' }
];

function isActive(path: string) {
  return route.path === path;
}
</script>

<template>
  <aside
    data-layout-sider
    :data-collapsed="props.collapsed"
    class="shrink-0 overflow-hidden border-r border-[var(--border-color)] bg-[var(--card-bg)] transition-[width,background-color] duration-200 max-md:w-64px"
    :class="props.collapsed ? 'w-64px' : 'w-220px'"
  >
    <div class="h-56px flex items-center gap-10px border-b border-[var(--border-color)] px-14px">
      <span class="size-36px shrink-0 flex items-center justify-center rd-8px bg-primary font-700 text-white">SA</span>
      <strong v-if="!props.collapsed" class="whitespace-nowrap text-16px max-md:hidden">Soybean Admin</strong>
    </div>

    <nav data-layout-nav class="flex flex-col gap-8px p-10px">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :data-nav-to="item.to"
        :to="item.to"
        class="h-40px flex items-center gap-10px rd-8px px-10px transition-colors duration-200"
        :class="isActive(item.to) ? 'bg-primary text-white' : 'hover:bg-[var(--layout-bg)]'"
      >
        <span class="w-24px shrink-0 text-center font-600">{{ item.shortLabel }}</span>
        <span v-if="!props.collapsed" class="whitespace-nowrap max-md:hidden">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>
