<script setup lang="ts">
import { NBreadcrumb, NBreadcrumbItem } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import LocaleSwitch from '@/components/locale-switch.vue';
import { useAuthStore } from '@/store/auth';
import { useRouteStore } from '@/store/route';

defineOptions({ name: 'LayoutHeader' });

const props = defineProps<{
  collapsed: boolean;
}>();

const emit = defineEmits<{
  toggleSider: [];
}>();

const authStore = useAuthStore();
const routeStore = useRouteStore();
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
    class="h-56px shrink-0 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-bg)] px-16px transition-colors duration-200"
  >
    <div class="min-w-0 flex items-center gap-12px">
      <button
        data-layout-action="toggle-sider"
        class="size-36px shrink-0 rd-8px border border-[var(--border-color)] bg-transparent transition-opacity hover:(opacity-80)"
        type="button"
        :aria-label="props.collapsed ? t('common.expandSidebar') : t('common.collapseSidebar')"
        @click="emit('toggleSider')"
      >
        {{ props.collapsed ? '→' : '←' }}
      </button>
      <NBreadcrumb v-if="routeStore.breadcrumbs.length" data-layout-breadcrumb class="min-w-0 overflow-hidden">
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

    <div v-if="authStore.isLogin" class="flex items-center gap-10px">
      <LocaleSwitch />
      <span data-auth-user class="text-14px max-sm:hidden">{{ authStore.userInfo?.userName }}</span>
      <button
        data-auth-action="logout"
        class="h-34px rd-8px border border-[var(--border-color)] bg-transparent px-10px text-13px transition-opacity hover:(opacity-80)"
        type="button"
        @click="logout"
      >
        {{ t('common.logout') }}
      </button>
    </div>
    <span v-else class="text-13px opacity-60 max-sm:hidden">{{ t('common.verticalLayout') }}</span>
  </header>
</template>
