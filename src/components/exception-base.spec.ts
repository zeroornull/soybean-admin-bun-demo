// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { describe, expect, it } from 'vitest';
import { enUS } from '@/locales/langs/en-us';
import { zhCN } from '@/locales/langs/zh-cn';
import ExceptionBase from './exception-base.vue';

function mountException(code: 403 | 404 | 500) {
  const configs = {
    403: {
      titleKey: 'error.forbidden',
      descriptionKey: 'error.forbiddenDescription',
      illustration: 'permission' as const,
      primaryAction: { labelKey: 'common.backHome' },
      secondaryAction: { labelKey: 'common.goBack' }
    },
    404: {
      titleKey: 'error.notFound',
      descriptionKey: 'error.notFoundDescription',
      illustration: 'not-found' as const,
      primaryAction: { labelKey: 'common.backHome' },
      secondaryAction: { labelKey: 'common.goBack' }
    },
    500: {
      titleKey: 'error.serverError',
      descriptionKey: 'error.serverErrorDescription',
      illustration: 'server' as const,
      primaryAction: { labelKey: 'common.retry' },
      secondaryAction: { labelKey: 'common.backHome' }
    }
  };
  const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS
    }
  });

  return mount(ExceptionBase, {
    props: {
      code,
      ...configs[code]
    },
    global: {
      plugins: [i18n],
      stubs: {
        LocaleSwitch: true,
        ThemeControls: true
      }
    }
  });
}

describe('ExceptionBase', () => {
  it('renders the 403 title and recovery actions', async () => {
    const wrapper = mountException(403);

    expect(wrapper.attributes('data-page')).toBe('forbidden');
    expect(wrapper.attributes('data-exception-code')).toBe('403');
    expect(wrapper.get('h1').text()).toBe('无访问权限');
    expect(wrapper.get('[data-exception-action="primary"]').text()).toBe('返回首页');
    expect(wrapper.get('[data-exception-action="secondary"]').text()).toBe('返回上一页');

    await wrapper.get('[data-exception-action="primary"]').trigger('click');
    await wrapper.get('[data-exception-action="secondary"]').trigger('click');

    expect(wrapper.emitted('primary')).toHaveLength(1);
    expect(wrapper.emitted('secondary')).toHaveLength(1);
  });

  it('renders distinct 404 and 500 copy', () => {
    const notFound = mountException(404);
    const serverError = mountException(500);

    expect(notFound.attributes('data-page')).toBe('not-found');
    expect(notFound.get('h1').text()).toBe('页面不存在');
    expect(serverError.attributes('data-page')).toBe('server-error');
    expect(serverError.get('h1').text()).toBe('服务暂时不可用');
    expect(serverError.get('[data-exception-action="primary"]').text()).toBe('重试');
  });
});
