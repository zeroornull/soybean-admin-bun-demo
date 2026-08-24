import { dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui';
import type { NDateLocale, NLocale } from 'naive-ui';
import type { AppLocale } from './index';

export const naiveLocales: Record<AppLocale, NLocale> = {
  'zh-CN': zhCN,
  'en-US': enUS
};

export const naiveDateLocales: Record<AppLocale, NDateLocale> = {
  'zh-CN': dateZhCN,
  'en-US': dateEnUS
};
