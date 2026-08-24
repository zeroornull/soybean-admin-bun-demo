<script setup lang="ts">
import { computed, h } from 'vue';
import { NMenu, type MenuOption } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useRouteStore, type MenuItem } from '@/store/route';

defineOptions({ name: 'LayoutSider' });

const props = defineProps<{
  collapsed: boolean;
}>();

const router = useRouter();
const routeStore = useRouteStore();
const { t } = useI18n();

const menuThemeOverrides = {
  borderRadius: '8px',
  color: 'transparent',
  itemColorActive: 'var(--primary)',
  itemColorActiveCollapsed: 'var(--primary)',
  itemColorActiveHover: 'var(--primary)',
  itemColorHover: 'var(--layout-bg)',
  itemIconColor: 'var(--text-color)',
  itemIconColorActive: '#ffffff',
  itemIconColorActiveHover: '#ffffff',
  itemTextColor: 'var(--text-color)',
  itemTextColorActive: '#ffffff',
  itemTextColorActiveHover: '#ffffff'
};

function createMenuIcon(item: MenuItem, label: string) {
  return () =>
    h(
      'span',
      {
        'aria-hidden': 'true',
        class: 'w-22px inline-flex items-center justify-center text-17px font-700'
      },
      item.icon || label.slice(0, 1)
    );
}

function transformMenuOption(item: MenuItem): MenuOption {
  const label = item.i18nKey ? t(item.i18nKey) : item.label;

  return {
    key: item.key,
    label,
    icon: createMenuIcon(item, label),
    children: item.children?.map(transformMenuOption)
  };
}

const menuOptions = computed<MenuOption[]>(() => routeStore.menus.map(transformMenuOption));

async function handleSelect(key: string | number) {
  await router.push({ name: String(key) });
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
      <strong v-if="!props.collapsed" class="whitespace-nowrap text-16px max-md:hidden">
        {{ t('common.appName') }}
      </strong>
    </div>

    <nav data-layout-nav class="p-8px">
      <NMenu
        data-route-menu
        :value="routeStore.selectedMenuKey"
        :options="menuOptions"
        :collapsed="props.collapsed"
        :collapsed-width="48"
        :collapsed-icon-size="22"
        :indent="18"
        :theme-overrides="menuThemeOverrides"
        @update:value="handleSelect"
      />
    </nav>
  </aside>
</template>
