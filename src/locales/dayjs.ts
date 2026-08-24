import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import type { AppLocale } from './index';

const dayjsLocales: Record<AppLocale, string> = {
  'zh-CN': 'zh-cn',
  'en-US': 'en'
};

export function setDayjsLocale(locale: AppLocale) {
  dayjs.locale(dayjsLocales[locale]);
}

export { dayjs };
