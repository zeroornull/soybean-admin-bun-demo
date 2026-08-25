import type { RouteRecordRaw } from 'vue-router';

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login-layout',
    component: () => import('@/layouts/blank-layout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('@/views/login/index.vue'),
        meta: {
          title: '登录',
          i18nKey: 'route.login',
          constant: true
        }
      }
    ]
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/_builtin/403/index.vue'),
    meta: {
      title: '无权限',
      i18nKey: 'route.forbidden',
      constant: true
    }
  },
  {
    path: '/404',
    name: 'not-found-page',
    component: () => import('@/views/_builtin/404/index.vue'),
    meta: {
      title: '页面不存在',
      i18nKey: 'route.notFound',
      constant: true
    }
  },
  {
    path: '/500',
    name: 'server-error',
    component: () => import('@/views/_builtin/500/index.vue'),
    meta: {
      title: '服务异常',
      i18nKey: 'route.serverError',
      constant: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/_builtin/404/index.vue'),
    meta: {
      title: '页面不存在',
      i18nKey: 'route.notFound',
      constant: true
    }
  }
];

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    redirect: { name: 'home' },
    component: () => import('@/layouts/base-layout.vue'),
    meta: {
      title: '',
      hideInMenu: true,
      requiresAuth: true
    },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
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
      {
        path: 'restricted',
        name: 'restricted',
        component: () => import('@/views/restricted/index.vue'),
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
    ]
  }
];

export const routes = constantRoutes;
