import type { RouteOverride } from './types';

export const PAGE_DEGREE_SPLITTER = '_';
export const PATH_SPLITTER = '/';
export const LAYOUT_PREFIX = 'layout.';
export const VIEW_PREFIX = 'view.';
export const FIRST_LEVEL_ROUTE_COMPONENT_SPLIT = '$';

export const elegantRouterConfig = {
  pageDir: 'src/views',
  alias: { '@': 'src' } as Record<string, string>,
  layouts: {
    base: 'src/layouts/base-layout.vue',
    blank: 'src/layouts/blank-layout.vue'
  } as Record<string, string>,
  defaultLayout: 'base',
  constantNames: ['login', '403', '404', '500'],
  layoutByName: {
    login: 'blank',
    '403': 'blank',
    '404': 'blank',
    '500': 'blank'
  } as Record<string, string>,
  homeName: 'home',
  notFound: {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    layout: 'blank',
    view: '404'
  },
  overrides: {
    '403': {
      name: 'forbidden',
      meta: {
        title: '无权限',
        i18nKey: 'route.forbidden',
        constant: true,
        hideInMenu: true,
        hideInTab: true
      }
    },
    '404': {
      name: 'not-found-page',
      meta: {
        title: '页面不存在',
        i18nKey: 'route.notFound',
        constant: true,
        hideInMenu: true,
        hideInTab: true
      }
    },
    '500': {
      name: 'server-error',
      meta: {
        title: '服务异常',
        i18nKey: 'route.serverError',
        constant: true,
        hideInMenu: true,
        hideInTab: true
      }
    },
    login: {
      meta: {
        title: '登录',
        i18nKey: 'route.login',
        constant: true,
        hideInMenu: true,
        hideInTab: true
      }
    },
    home: {
      meta: {
        title: '首页',
        i18nKey: 'route.home',
        icon: '⌂',
        order: 1,
        componentName: 'Home',
        keepAlive: true,
        pinned: true,
        requiresAuth: true
      }
    },
    restricted: {
      meta: {
        title: '受限页',
        i18nKey: 'route.restricted',
        icon: '⚿',
        order: 20,
        componentName: 'Restricted',
        keepAlive: true,
        requiresAuth: true,
        roles: ['R_NOBODY']
      }
    }
  } as Record<string, RouteOverride>
};
