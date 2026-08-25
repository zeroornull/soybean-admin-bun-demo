<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProvidedLayoutShell } from '@/layouts/use-layout-shell';
import LayoutMenu from './menu.vue';

defineOptions({ name: 'LayoutSider' });

const props = defineProps<{
  collapsed: boolean;
}>();

const { t } = useI18n();
const { chrome, siderMenus, childSiderMenus, activeFirstLevelKey, selectMenu } = useProvidedLayoutShell();
const isMix = computed(() => chrome.value.siderVariant === 'mix');
const siderCollapsed = computed(() => isMix.value || props.collapsed);
const widthClass = computed(() => {
  if (isMix.value) return chrome.value.mixChildSider ? 'w-290px' : 'w-90px';
  return props.collapsed ? 'w-64px' : 'w-220px';
});
</script>

<template>
  <aside
    data-layout-sider
    :data-collapsed="siderCollapsed"
    :data-sider-variant="chrome.siderVariant"
    class="shrink-0 overflow-hidden border-r border-[var(--border-color)] bg-[var(--card-bg)] transition-[width,background-color] duration-200"
    :class="[widthClass, isMix ? '' : 'max-md:w-64px']"
  >
    <div class="h-full flex">
      <div data-layout-sider-primary class="min-w-0 flex flex-1 flex-col">
        <div class="h-56px flex items-center gap-10px border-b border-[var(--border-color)] px-14px">
          <span class="size-36px shrink-0 flex items-center justify-center rd-8px bg-primary font-700 text-white">
            SA
          </span>
          <strong v-if="!siderCollapsed" class="whitespace-nowrap text-16px max-md:hidden">
            {{ t('common.appName') }}
          </strong>
        </div>

        <nav data-layout-nav class="p-8px">
          <LayoutMenu
            :menus="siderMenus"
            :collapsed="siderCollapsed"
            :auto-navigate="false"
            :selected-key="chrome.siderMenus === 'first' ? activeFirstLevelKey : undefined"
            @select="key => selectMenu(key, 'sider')"
          />
        </nav>
      </div>

      <div
        v-if="chrome.mixChildSider"
        data-layout-sider-child
        class="w-200px shrink-0 border-l border-[var(--border-color)]"
      >
        <div class="h-56px flex items-center border-b border-[var(--border-color)] px-14px text-14px">
          {{ t('layout.subMenu') }}
        </div>
        <nav class="p-8px">
          <LayoutMenu :menus="childSiderMenus" :auto-navigate="false" @select="key => selectMenu(key, 'child')" />
        </nav>
      </div>
    </div>
  </aside>
</template>
