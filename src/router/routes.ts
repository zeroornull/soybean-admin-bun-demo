import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    redirect: { name: 'home' },
    component: () => import('@/layouts/base-layout.vue'),
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          requiresAuth: true
        }
      }
    ]
  },
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
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/_builtin/404/index.vue'),
    meta: {
      title: '页面不存在',
      constant: true
    }
  }
];
