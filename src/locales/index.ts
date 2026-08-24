import type { App } from 'vue';
import { createI18n } from 'vue-i18n';
import type { RouteMeta } from 'vue-router';
import { getLocaleSetting, setLocaleSetting } from '@/utils/storage';
import { setDayjsLocale } from './dayjs';
import { enUS } from './langs/en-us';
import { zhCN } from './langs/zh-cn';

export const supportedLocales = ['zh-CN', 'en-US'] as const;
export type AppLocale = (typeof supportedLocales)[number];
export const defaultLocale: AppLocale = 'zh-CN';

export function resolveLocale(value: unknown): AppLocale {
  return supportedLocales.includes(value as AppLocale) ? (value as AppLocale) : defaultLocale;
}

export const initialLocale = resolveLocale(getLocaleSetting());

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

export function setupI18n(app: App) {
  app.use(i18n);
}

export function syncLocale(locale: AppLocale) {
  i18n.global.locale.value = locale;
  setDayjsLocale(locale);
  setLocaleSetting(locale);

  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

export function getRouteTitle(meta: RouteMeta) {
  return meta.i18nKey ? i18n.global.t(meta.i18nKey) : meta.title;
}

export function setDocumentTitle(meta: RouteMeta) {
  const routeTitle = getRouteTitle(meta);
  document.title = routeTitle ? `${routeTitle} | ${import.meta.env.VITE_APP_TITLE}` : import.meta.env.VITE_APP_TITLE;
}
