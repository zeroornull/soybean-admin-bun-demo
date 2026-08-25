<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NDivider, NDrawer, NDrawerContent, NInput, NInputNumber, NSwitch, NTabPane, NTabs } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { layoutModes } from '@/layouts/layout-mode';
import { useAppStore } from '@/store/app';
import { useThemeStore } from '@/store/theme';
import { maxThemeRadius, minThemeRadius, themePresets } from '@/theme/settings';

defineOptions({ name: 'ThemeDrawer' });

const appStore = useAppStore();
const themeStore = useThemeStore();
const { t } = useI18n();
const activeTab = ref('appearance');
</script>

<template>
  <NDrawer
    v-model:show="appStore.themeDrawerVisible"
    data-theme-drawer
    display-directive="show"
    :width="'min(90vw, 400px)'"
  >
    <NDrawerContent :title="t('theme.drawerTitle')" closable :native-scrollbar="false">
      <NTabs v-model:value="activeTab" type="segment" size="small" data-theme-drawer-tabs>
        <NTabPane name="appearance" :tab="t('theme.tabs.appearance')">
          <NDivider title-placement="left">{{ t('theme.themeColor') }}</NDivider>
          <div class="grid gap-12px">
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.switchScheme', { scheme: t(`theme.${themeStore.themeScheme}`) }) }}</span>
              <button
                data-theme-action="scheme"
                class="h-32px rd-8px border border-[var(--border-color)] bg-transparent px-10px"
                type="button"
                @click="themeStore.toggleThemeScheme"
              >
                {{ t(`theme.${themeStore.themeScheme}`) }}
              </button>
            </label>
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.themeColor') }}</span>
              <input
                data-theme-drawer-color
                class="h-32px w-48px cursor-pointer border-0 bg-transparent"
                type="color"
                :value="themeStore.themeColor"
                @input="themeStore.setThemeColor(($event.target as HTMLInputElement).value)"
              />
            </label>
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.radius') }}</span>
              <NInputNumber
                data-theme-radius-input
                size="small"
                class="w-120px"
                :min="minThemeRadius"
                :max="maxThemeRadius"
                :value="themeStore.extras.radius"
                @update:value="value => themeStore.setThemeRadius(value ?? minThemeRadius)"
              />
            </label>
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.grayscale') }}</span>
              <NSwitch
                data-theme-grayscale
                size="small"
                :value="themeStore.extras.grayscale"
                @update:value="themeStore.setGrayscale"
              />
            </label>
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.colourWeakness') }}</span>
              <NSwitch
                data-theme-colour-weakness
                size="small"
                :value="themeStore.extras.colourWeakness"
                @update:value="themeStore.setColourWeakness"
              />
            </label>
          </div>
        </NTabPane>

        <NTabPane name="layout" :tab="t('theme.tabs.layout')">
          <NDivider title-placement="left">{{ t('layout.switchMode') }}</NDivider>
          <label class="mb-16px flex items-center justify-between gap-12px">
            <span class="sr-only">{{ t('layout.switchMode') }}</span>
            <select
              data-theme-drawer-layout-mode
              class="h-34px w-full rd-8px border border-[var(--border-color)] bg-transparent px-8px"
              :value="themeStore.layoutMode"
              @change="
                themeStore.setLayoutMode(($event.target as HTMLSelectElement).value as typeof themeStore.layoutMode)
              "
            >
              <option v-for="mode in layoutModes" :key="mode" :value="mode">
                {{ t(`layout.mode.${mode}`) }}
              </option>
            </select>
          </label>

          <NDivider title-placement="left">{{ t('theme.blocks.title') }}</NDivider>
          <div class="grid gap-12px">
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.blocks.tabs') }}</span>
              <NSwitch
                data-theme-block="tabs"
                size="small"
                :value="themeStore.extras.blocks.tabs"
                @update:value="value => themeStore.setBlockVisible('tabs', value)"
              />
            </label>
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.blocks.breadcrumb') }}</span>
              <NSwitch
                data-theme-block="breadcrumb"
                size="small"
                :value="themeStore.extras.blocks.breadcrumb"
                @update:value="value => themeStore.setBlockVisible('breadcrumb', value)"
              />
            </label>
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.blocks.footer') }}</span>
              <NSwitch
                data-theme-block="footer"
                size="small"
                :value="themeStore.extras.blocks.footer"
                @update:value="value => themeStore.setBlockVisible('footer', value)"
              />
            </label>
          </div>

          <NDivider title-placement="left">{{ t('theme.tabsBar.title') }}</NDivider>
          <div class="grid gap-12px">
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.tabsBar.mode') }}</span>
              <select
                data-theme-tab-mode
                class="h-32px rd-8px border border-[var(--border-color)] bg-transparent px-8px"
                :value="themeStore.extras.tabMode"
                @change="
                  themeStore.setTabMode(($event.target as HTMLSelectElement).value as typeof themeStore.extras.tabMode)
                "
              >
                <option value="button">{{ t('theme.tabsBar.button') }}</option>
                <option value="chrome">{{ t('theme.tabsBar.chrome') }}</option>
              </select>
            </label>
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.tabsBar.cache') }}</span>
              <NSwitch
                data-theme-tab-cache
                size="small"
                :value="themeStore.extras.tabCache"
                @update:value="themeStore.setTabCache"
              />
            </label>
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.tabsBar.middleClick') }}</span>
              <NSwitch
                data-theme-tab-middle-click
                size="small"
                :value="themeStore.extras.closeTabByMiddleClick"
                @update:value="themeStore.setCloseTabByMiddleClick"
              />
            </label>
          </div>
        </NTabPane>

        <NTabPane name="general" :tab="t('theme.tabs.general')">
          <NDivider title-placement="left">{{ t('theme.watermark.title') }}</NDivider>
          <div class="grid gap-12px">
            <label class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.watermark.visible') }}</span>
              <NSwitch
                data-theme-watermark="visible"
                size="small"
                :value="themeStore.extras.watermark.visible"
                @update:value="value => themeStore.patchWatermark({ visible: value })"
              />
            </label>
            <label v-if="themeStore.extras.watermark.visible" class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.watermark.userName') }}</span>
              <NSwitch
                data-theme-watermark="userName"
                size="small"
                :value="themeStore.extras.watermark.enableUserName"
                @update:value="value => themeStore.patchWatermark({ enableUserName: value })"
              />
            </label>
            <label v-if="themeStore.extras.watermark.visible" class="flex items-center justify-between gap-12px">
              <span>{{ t('theme.watermark.time') }}</span>
              <NSwitch
                data-theme-watermark="time"
                size="small"
                :value="themeStore.extras.watermark.enableTime"
                @update:value="value => themeStore.patchWatermark({ enableTime: value })"
              />
            </label>
            <label
              v-if="
                themeStore.extras.watermark.visible &&
                !themeStore.extras.watermark.enableUserName &&
                !themeStore.extras.watermark.enableTime
              "
              class="flex items-center justify-between gap-12px"
            >
              <span>{{ t('theme.watermark.text') }}</span>
              <NInput
                data-theme-watermark-text
                size="small"
                class="w-160px"
                :value="themeStore.extras.watermark.text"
                @update:value="value => themeStore.patchWatermark({ text: value })"
              />
            </label>
          </div>
        </NTabPane>

        <NTabPane name="preset" :tab="t('theme.tabs.preset')">
          <div class="grid gap-10px">
            <button
              v-for="preset in themePresets"
              :key="preset.id"
              :data-theme-preset="preset.id"
              class="flex items-start gap-12px rd-10px border border-[var(--border-color)] bg-transparent p-12px text-left transition-colors hover:border-primary"
              type="button"
              @click="themeStore.applyPreset(preset.id)"
            >
              <span class="mt-4px size-18px shrink-0 rd-full" :style="{ background: preset.themeColor }" />
              <span>
                <strong class="block text-14px">{{ t(preset.nameKey) }}</strong>
                <span class="mt-4px block text-12px opacity-70">{{ t(preset.descKey) }}</span>
              </span>
            </button>
          </div>
        </NTabPane>
      </NTabs>

      <template #footer>
        <div class="flex justify-end">
          <NButton data-theme-drawer-reset type="error" ghost @click="themeStore.resetTheme">
            {{ t('theme.reset') }}
          </NButton>
        </div>
      </template>
    </NDrawerContent>
  </NDrawer>
</template>
