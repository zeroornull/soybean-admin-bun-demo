<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppStore } from '@/store/app';
import { useTabStore } from '@/store/tab';
import { useThemeStore } from '@/store/theme';

defineOptions({ name: 'LayoutTabs' });

const appStore = useAppStore();
const tabStore = useTabStore();
const themeStore = useThemeStore();
const { t } = useI18n();
const draggingId = ref('');
const hasClosableTabs = computed(() => tabStore.tabs.some(tab => !tab.pinned));
const hasOtherClosableTabs = computed(() => tabStore.tabs.some(tab => !tab.pinned && tab.id !== tabStore.activeTabId));
const tabMode = computed(() => themeStore.extras.tabMode);

function getTabLabel(tab: (typeof tabStore.tabs)[number]) {
  return tab.labelKey ? t(tab.labelKey) : tab.label;
}

function handleDragStart(event: DragEvent, id: string) {
  draggingId.value = id;
  event.dataTransfer?.setData('text/plain', id);
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
}

function handleDrop(event: DragEvent, id: string) {
  event.preventDefault();
  const fromId = draggingId.value || event.dataTransfer?.getData('text/plain') || '';
  if (fromId) tabStore.moveTab(fromId, id);
  draggingId.value = '';
}

function handleDragEnd() {
  draggingId.value = '';
}

function handleTabMouseDown(event: MouseEvent, id: string, pinned: boolean) {
  if (event.button !== 1 || !themeStore.extras.closeTabByMiddleClick || pinned) return;

  event.preventDefault();
  void tabStore.removeTab(id);
}
</script>

<template>
  <section
    data-layout-tabs
    :data-tab-mode="tabMode"
    class="h-44px shrink-0 flex items-center gap-8px border-b border-[var(--border-color)] bg-[var(--card-bg)] px-10px"
  >
    <div
      role="tablist"
      :aria-label="t('common.openPages')"
      class="min-w-0 flex flex-1 overflow-x-auto py-6px"
      :class="tabMode === 'chrome' ? 'items-end gap-0' : 'items-center gap-6px'"
    >
      <div
        v-for="tab in tabStore.tabs"
        :key="tab.id"
        :data-tab-id="tab.id"
        :data-tab-active="tab.id === tabStore.activeTabId"
        :data-tab-pinned="tab.pinned"
        draggable="true"
        class="shrink-0 flex items-center border transition-colors"
        :class="
          tabMode === 'chrome'
            ? [
                'relative -ml-8px h-34px first:ml-0',
                tab.id === tabStore.activeTabId
                  ? 'z-1 border-transparent bg-[var(--layout-bg)] rd-t-10px'
                  : 'z-0 border-transparent bg-transparent rd-t-10px hover:bg-[var(--layout-bg)]'
              ]
            : [
                'h-30px rd-7px',
                tab.id === tabStore.activeTabId
                  ? 'border-primary bg-primary text-white'
                  : 'border-[var(--border-color)] bg-transparent hover:bg-[var(--layout-bg)]'
              ]
        "
        @dragstart="handleDragStart($event, tab.id)"
        @dragover="handleDragOver"
        @drop="handleDrop($event, tab.id)"
        @dragend="handleDragEnd"
        @mousedown="handleTabMouseDown($event, tab.id, tab.pinned)"
      >
        <button
          :id="`tab-${tab.id}`"
          data-tab-action="switch"
          role="tab"
          :aria-selected="tab.id === tabStore.activeTabId"
          class="h-full bg-transparent px-10px text-inherit"
          type="button"
          @click="tabStore.switchTab(tab.id)"
        >
          <span v-if="tab.pinned" aria-hidden="true" class="mr-5px">•</span>
          {{ getTabLabel(tab) }}
        </button>
        <button
          v-if="!tab.pinned"
          data-tab-action="close"
          class="mr-5px size-20px flex items-center justify-center rd-5px bg-transparent text-inherit transition-opacity hover:opacity-70"
          type="button"
          :aria-label="t('common.closeTab', { label: getTabLabel(tab) })"
          @click.stop="tabStore.removeTab(tab.id)"
        >
          ×
        </button>
      </div>
    </div>

    <div class="shrink-0 flex items-center gap-5px">
      <button
        data-tab-action="reload"
        class="size-30px rd-7px border border-[var(--border-color)] bg-transparent disabled:cursor-not-allowed disabled:opacity-45"
        type="button"
        :aria-label="t('common.reloadCurrentTab')"
        :title="t('common.reloadCurrentTab')"
        :disabled="appStore.reloading || !tabStore.activeTab"
        @click="appStore.reloadPage"
      >
        ↻
      </button>
      <button
        data-tab-action="close-others"
        class="size-30px rd-7px border border-[var(--border-color)] bg-transparent disabled:cursor-not-allowed disabled:opacity-45 max-sm:hidden"
        type="button"
        :aria-label="t('common.closeOtherTabs')"
        :title="t('common.closeOtherTabs')"
        :disabled="!hasOtherClosableTabs"
        @click="tabStore.removeOthers(tabStore.activeTabId)"
      >
        ◉
      </button>
      <button
        data-tab-action="close-all"
        class="size-30px rd-7px border border-[var(--border-color)] bg-transparent disabled:cursor-not-allowed disabled:opacity-45 max-sm:hidden"
        type="button"
        :aria-label="t('common.closeAllTabs')"
        :title="t('common.closeAllTabs')"
        :disabled="!hasClosableTabs"
        @click="tabStore.removeAll"
      >
        ×
      </button>
    </div>
  </section>
</template>
