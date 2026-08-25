<script setup lang="ts">
import { NBreadcrumb, NBreadcrumbItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useProvidedLayoutShell } from '@/layouts/use-layout-shell';
import { useAuthStore } from '@/store/auth';
import { useRouteStore } from '@/store/route';
import { useThemeStore } from '@/store/theme';
import GlobalSearch from './global-search.vue';
import LayoutMenu from './menu.vue';
import LayoutModeSwitch from './mode-switch.vue';

defineOptions({ name: 'LayoutHeader' });

const props = defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggleSider: [];
}>();

const authStore = useAuthStore();
const routeStore = useRouteStore();
const themeStore = useThemeStore();
const { chrome, headerMenus, activeFirstLevelKey, selectMenu } = useProvidedLayoutShell();
const { t } = useI18n();

function getBreadcrumbLabel(item: (typeof routeStore.breadcrumbs)[number]) {
  return item.i18nKey ? t(item.i18nKey) : item.label;
}

async function logout() {
  await authStore.resetStore();
}
</script>

<template>
  <header
    data-layout-header
    class="h-56px shrink-0 flex items-center justify-between gap-12px border-b border-[var(--border-color)] bg-[var(--card-bg)] px-16px transition-colors duration-200"
  >
    <div class="min-w-0 flex flex-1 items-center gap-12px">
      <button
        v-if="chrome.showSiderToggle"
        data-layout-action="toggle-sider"
        class="size-36px shrink-0 rd-8px border border-[var(--border-color)] bg-transparent transition-opacity hover:(opacity-80)"
        type="button"
        :aria-label="props.collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')"
        @click="emit('toggleSider')"
      >
        <SvgIcon local-icon="menu" />
      </button>

      <div v-if="chrome.showHeaderLogo" data-layout-header-logo class="shrink-0 flex items-center gap-8px">
        <span class="size-36px flex items-center justify-center rd-8px bg-primary font-700 text-white">SA</span>
        <strong class="hidden text-16px lg:inline">{{ t('common.appName') }}</strong>
      </div>

      <nav v-if="chrome.showHeaderMenu" data-layout-header-menu class="min-w-0 flex-1 overflow-x-auto">
        <LayoutMenu
          mode="horizontal"
          :menus="headerMenus"
          :auto-navigate="false"
          :selected-key="chrome.headerMenus === 'first' ? activeFirstLevelKey : undefined"
          @select="key => selectMenu(key, 'header')"
        />
      </nav>

      <NBreadcrumb
        v-else-if="themeStore.extras.blocks.breadcrumb && routeStore.breadcrumbs.length"
        data-layout-breadcrumb
        class="min-w-0 overflow-hidden"
      >
        <NBreadcrumbItem
          v-for="(item, index) in routeStore.breadcrumbs"
          :key="item.key"
          :data-breadcrumb-key="item.key"
        >
          <RouterLink
            v-if="index < routeStore.breadcrumbs.length - 1"
            :to="item.path"
            class="transition-colors hover:text-primary"
          >
            {{ getBreadcrumbLabel(item) }}
          </RouterLink>
          <strong v-else data-breadcrumb-current class="text-[var(--text-color)]">
            {{ getBreadcrumbLabel(item) }}
          </strong>
        </NBreadcrumbItem>
      </NBreadcrumb>
      <strong v-else data-layout-title class="truncate text-16px">{{ t('common.appName') }}</strong>
    </div>

    <div v-if="authStore.isLogin" class="shrink-0 flex items-center gap-10px">
      <GlobalSearch v-if="themeStore.extras.blocks.search" />
      <LayoutModeSwitch />
      <ThemeControls />
      <LocaleSwitch />
      <span data-auth-user class="text-14px max-sm:hidden">{{ authStore.userInfo?.userName }}</span>
      <button
        data-auth-action="logout"
        class="h-34px rd-8px border border-[var(--border-color)] bg-transparent px-10px text-13px transition-opacity hover:(opacity-80)"
        type="button"
        @click="logout"
      >
        <SvgIcon local-icon="logout" class="mr-6px" />
        {{ t('common.logout') }}
      </button>
    </div>
    <span v-else class="text-13px opacity-60 max-sm:hidden">{{ t(`layout.mode.${themeStore.layoutMode}`) }}</span>
  </header>
</template>
