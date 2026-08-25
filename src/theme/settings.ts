import type { LayoutMode } from '@/layouts/layout-mode';
import { defaultTabMode, resolveTabMode, type TabMode } from '@/store/tab-shared';

export interface ThemeWatermark {
  visible: boolean;
  text: string;
  enableUserName: boolean;
  enableTime: boolean;
}

export interface ThemeBlocks {
  tabs: boolean;
  breadcrumb: boolean;
  footer: boolean;
  search: boolean;
}

export interface ThemeExtras {
  radius: number;
  grayscale: boolean;
  colourWeakness: boolean;
  watermark: ThemeWatermark;
  blocks: ThemeBlocks;
  tabMode: TabMode;
  tabCache: boolean;
  closeTabByMiddleClick: boolean;
}

export interface ThemePreset {
  id: string;
  nameKey: string;
  descKey: string;
  themeScheme: 'light' | 'dark' | 'auto';
  themeColor: string;
  layoutMode: LayoutMode;
  extras: ThemeExtras;
}

export const defaultThemeRadius = 6;
export const minThemeRadius = 0;
export const maxThemeRadius = 16;
export const defaultWatermarkText = 'SoybeanAdmin';

export const defaultThemeExtras: ThemeExtras = {
  radius: defaultThemeRadius,
  grayscale: false,
  colourWeakness: false,
  watermark: {
    visible: false,
    text: defaultWatermarkText,
    enableUserName: false,
    enableTime: false
  },
  blocks: {
    tabs: true,
    breadcrumb: true,
    footer: false,
    search: true
  },
  tabMode: defaultTabMode,
  tabCache: true,
  closeTabByMiddleClick: true
};

function cloneExtras(value: ThemeExtras): ThemeExtras {
  return JSON.parse(JSON.stringify(value)) as ThemeExtras;
}

export function clampThemeRadius(value: unknown) {
  const radius = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(radius)) return defaultThemeRadius;

  return Math.min(maxThemeRadius, Math.max(minThemeRadius, Math.round(radius)));
}

export function parseThemeExtras(raw: unknown): ThemeExtras {
  let source: unknown = raw;

  if (typeof raw === 'string') {
    try {
      source = JSON.parse(raw);
    } catch {
      return cloneExtras(defaultThemeExtras);
    }
  }

  if (!source || typeof source !== 'object') return cloneExtras(defaultThemeExtras);

  const input = source as Record<string, unknown>;
  const watermark =
    input.watermark && typeof input.watermark === 'object' ? (input.watermark as Record<string, unknown>) : {};
  const blocks = input.blocks && typeof input.blocks === 'object' ? (input.blocks as Record<string, unknown>) : {};
  const enableUserName = Boolean(watermark.enableUserName);

  return {
    radius: clampThemeRadius(input.radius),
    grayscale: Boolean(input.grayscale),
    colourWeakness: Boolean(input.colourWeakness),
    watermark: {
      visible: Boolean(watermark.visible),
      text: typeof watermark.text === 'string' && watermark.text.trim() ? watermark.text : defaultWatermarkText,
      enableUserName,
      enableTime: Boolean(watermark.enableTime) && !enableUserName
    },
    blocks: {
      tabs: blocks.tabs !== false,
      breadcrumb: blocks.breadcrumb !== false,
      footer: Boolean(blocks.footer),
      search: blocks.search !== false
    },
    tabMode: resolveTabMode(input.tabMode),
    tabCache: input.tabCache !== false,
    closeTabByMiddleClick: input.closeTabByMiddleClick !== false
  };
}

export function resolveWatermarkContent(
  watermark: ThemeWatermark,
  userName: string | null | undefined,
  formattedTime: string
) {
  if (!watermark.visible) return '';
  if (watermark.enableUserName) return userName || watermark.text;
  if (watermark.enableTime) return formattedTime;
  return watermark.text;
}

export const themePresets: ThemePreset[] = [
  {
    id: 'default',
    nameKey: 'theme.preset.default',
    descKey: 'theme.preset.defaultDesc',
    themeScheme: 'light',
    themeColor: '#646cff',
    layoutMode: 'vertical',
    extras: cloneExtras(defaultThemeExtras)
  },
  {
    id: 'dark',
    nameKey: 'theme.preset.dark',
    descKey: 'theme.preset.darkDesc',
    themeScheme: 'dark',
    themeColor: '#646cff',
    layoutMode: 'vertical',
    extras: cloneExtras(defaultThemeExtras)
  },
  {
    id: 'compact',
    nameKey: 'theme.preset.compact',
    descKey: 'theme.preset.compactDesc',
    themeScheme: 'light',
    themeColor: '#18a058',
    layoutMode: 'horizontal',
    extras: {
      ...cloneExtras(defaultThemeExtras),
      radius: 2
    }
  },
  {
    id: 'azir',
    nameKey: 'theme.preset.azir',
    descKey: 'theme.preset.azirDesc',
    themeScheme: 'dark',
    themeColor: '#2d8cf0',
    layoutMode: 'vertical-mix',
    extras: {
      ...cloneExtras(defaultThemeExtras),
      radius: 10
    }
  }
];

export function getThemePreset(id: string) {
  return themePresets.find(preset => preset.id === id) ?? null;
}
