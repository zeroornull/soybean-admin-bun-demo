<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '@/store/app';
import { useTabStore } from '@/store/tab';

defineOptions({ name: 'LayoutTabs' });

const appStore = useAppStore();
const tabStore = useTabStore();
const hasClosableTabs = computed(() => tabStore.tabs.some(tab => !tab.pinned));
const hasOtherClosableTabs = computed(() =>
  tabStore.tabs.some(tab => !tab.pinned && tab.id !== tabStore.activeTabId)
);
</script>

<template>
  <section
    data-layout-tabs
    class="h-44px shrink-0 flex items-center gap-8px border-b border-[var(--border-color)] bg-[var(--card-bg)] px-10px"
  >
    <div role="tablist" aria-label="Open pages" class="min-w-0 flex flex-1 gap-6px overflow-x-auto py-6px">
      <div
        v-for="tab in tabStore.tabs"
        :key="tab.id"
        :data-tab-id="tab.id"
        :data-tab-active="tab.id === tabStore.activeTabId"
        :data-tab-pinned="tab.pinned"
        class="h-30px shrink-0 flex items-center rd-7px border transition-colors"
        :class="
          tab.id === tabStore.activeTabId
            ? 'border-primary bg-primary text-white'
            : 'border-[var(--border-color)] bg-transparent hover:bg-[var(--layout-bg)]'
        "
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
          <span v-if="tab.pinned" aria-hidden="true" class="mr-5px">•</span>{{ tab.label }}
        </button>
        <button
          v-if="!tab.pinned"
          data-tab-action="close"
          class="mr-5px size-20px flex items-center justify-center rd-5px bg-transparent text-inherit transition-opacity hover:opacity-70"
          type="button"
          :aria-label="`Close ${tab.label}`"
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
        aria-label="Reload current tab"
        title="Reload current tab"
        :disabled="appStore.reloading || !tabStore.activeTab"
        @click="appStore.reloadPage"
      >
        ↻
      </button>
      <button
        data-tab-action="close-others"
        class="size-30px rd-7px border border-[var(--border-color)] bg-transparent disabled:cursor-not-allowed disabled:opacity-45 max-sm:hidden"
        type="button"
        aria-label="Close other tabs"
        title="Close other tabs"
        :disabled="!hasOtherClosableTabs"
        @click="tabStore.removeOthers(tabStore.activeTabId)"
      >
        ◉
      </button>
      <button
        data-tab-action="close-all"
        class="size-30px rd-7px border border-[var(--border-color)] bg-transparent disabled:cursor-not-allowed disabled:opacity-45 max-sm:hidden"
        type="button"
        aria-label="Close all tabs"
        title="Close all tabs"
        :disabled="!hasClosableTabs"
        @click="tabStore.removeAll"
      >
        ×
      </button>
    </div>
  </section>
</template>
