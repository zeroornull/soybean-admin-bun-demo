<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { NEmpty, NInput, NModal } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/store/app';
import { useRouteStore } from '@/store/route';
import { useThemeStore } from '@/store/theme';
import {
  filterSearchEntries,
  flattenMenusToSearchEntries,
  getSearchLabel,
  moveActiveIndex,
  type SearchEntry
} from '@/layouts/search';

defineOptions({ name: 'GlobalSearch' });

const router = useRouter();
const appStore = useAppStore();
const routeStore = useRouteStore();
const themeStore = useThemeStore();
const { t } = useI18n();
const visible = ref(false);
const keyword = ref('');
const activeIndex = ref(0);
const inputRef = ref<{ focus?: () => void } | null>(null);

const commandEntries: SearchEntry[] = [
  {
    id: 'command.theme-drawer',
    kind: 'command',
    label: 'Theme settings',
    i18nKey: 'search.commandTheme'
  },
  {
    id: 'command.toggle-scheme',
    kind: 'command',
    label: 'Toggle theme',
    i18nKey: 'search.commandThemeScheme'
  }
];

const sourceEntries = computed(() => [...flattenMenusToSearchEntries(routeStore.menus), ...commandEntries]);
const results = computed(() => filterSearchEntries(sourceEntries.value, keyword.value, key => t(key)));
const activeEntry = computed(() => results.value[activeIndex.value] ?? null);

watch(results, entries => {
  activeIndex.value = entries.length ? Math.min(activeIndex.value, entries.length - 1) : 0;
});

async function openSearch() {
  visible.value = true;
  await nextTick();
  inputRef.value?.focus?.();
}

function closeSearch() {
  visible.value = false;
  keyword.value = '';
  activeIndex.value = 0;
}

function toggleSearch() {
  if (visible.value) closeSearch();
  else void openSearch();
}

async function runEntry(entry: SearchEntry | null) {
  if (!entry) return;

  closeSearch();

  if (entry.kind === 'route' && entry.path) {
    await router.push(entry.path);
    return;
  }

  if (entry.id === 'command.theme-drawer') appStore.openThemeDrawer();
  if (entry.id === 'command.toggle-scheme') themeStore.toggleThemeScheme();
}

function handleArrow(delta: number) {
  activeIndex.value = moveActiveIndex(results.value.length, activeIndex.value, delta);
}

function onDocumentKeydown(event: KeyboardEvent) {
  const isPaletteShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

  if (isPaletteShortcut) {
    event.preventDefault();
    toggleSearch();
    return;
  }

  if (!visible.value) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closeSearch();
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    handleArrow(1);
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    handleArrow(-1);
    return;
  }

  if (event.key === 'Enter') {
    event.preventDefault();
    void runEntry(activeEntry.value);
  }
}

onMounted(() => window.addEventListener('keydown', onDocumentKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onDocumentKeydown));
</script>

<template>
  <button
    data-search-action="open"
    class="size-34px rd-8px border border-[var(--border-color)] bg-transparent"
    type="button"
    :aria-label="t('search.open')"
    :title="t('search.open')"
    @click="openSearch"
  >
    ⌕
  </button>

  <NModal
    v-model:show="visible"
    preset="card"
    data-search-modal
    :title="t('search.title')"
    :closable="true"
    :auto-focus="false"
    class="w-full max-w-560px"
    @after-leave="closeSearch"
  >
    <NInput ref="inputRef" v-model:value="keyword" data-search-input clearable :placeholder="t('search.placeholder')" />

    <NEmpty v-if="!results.length" data-search-empty class="mt-16px" :description="t('search.empty')" />

    <ul v-else data-search-results class="mt-12px m-0 max-h-320px list-none overflow-auto p-0">
      <li v-for="(entry, index) in results" :key="entry.id">
        <button
          :data-search-item="entry.id"
          :data-search-active="index === activeIndex"
          class="mt-6px w-full flex items-center justify-between rd-8px border px-12px py-10px text-left"
          :class="
            index === activeIndex
              ? 'border-primary bg-primary text-white'
              : 'border-[var(--border-color)] bg-transparent'
          "
          type="button"
          @mouseenter="activeIndex = index"
          @click="runEntry(entry)"
        >
          <span>
            <strong class="block text-14px">{{ getSearchLabel(entry, key => t(key)) }}</strong>
            <span class="mt-2px block text-12px opacity-70">{{ entry.path || t('search.command') }}</span>
          </span>
          <span class="text-12px opacity-70">↵</span>
        </button>
      </li>
    </ul>

    <p class="mb-0 mt-12px text-12px opacity-60">{{ t('search.hint') }}</p>
  </NModal>
</template>
