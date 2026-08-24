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
      constant: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/_builtin/404/index.vue'),
    meta: {
      title: '页面不存在',
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
