<script setup lang="ts">
import { computed, h } from 'vue';
import { NMenu, type MenuOption } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import SvgIcon from '@/components/svg-icon.vue';
import { useRouteStore, type MenuItem } from '@/store/route';

defineOptions({ name: 'LayoutMenu' });

const props = withDefaults(
  defineProps<{
    menus: MenuItem[];
    mode?: 'vertical' | 'horizontal';
    collapsed?: boolean;
    autoNavigate?: boolean;
    selectedKey?: string | null;
  }>(),
  {
    mode: 'vertical',
    collapsed: false,
    autoNavigate: true,
    selectedKey: undefined
  }
);

const emit = defineEmits<{
  select: [key: string];
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
  if (item.icon) {
    return () =>
      h('span', { 'data-menu-icon': item.icon, class: 'inline-flex items-center' }, [
        h(SvgIcon, { localIcon: item.icon, class: 'text-18px' })
      ]);
  }

  return () =>
    h(
      'span',
      {
        'aria-hidden': 'true',
        class: 'w-22px inline-flex items-center justify-center text-17px font-700'
      },
      label.slice(0, 1)
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

const menuOptions = computed<MenuOption[]>(() => props.menus.map(transformMenuOption));

async function handleSelect(key: string | number) {
  const routeName = String(key);
  emit('select', routeName);

  if (!props.autoNavigate) return;

  await router.push({ name: routeName });
}
</script>

<template>
  <NMenu
    data-route-menu
    :mode="props.mode"
    :value="props.selectedKey ?? routeStore.selectedMenuKey"
    :options="menuOptions"
    :collapsed="props.collapsed"
    :collapsed-width="48"
    :collapsed-icon-size="22"
    :indent="18"
    :theme-overrides="menuThemeOverrides"
    @update:value="handleSelect"
  />
</template>
