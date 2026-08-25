import type { RouteRecordRaw } from 'vue-router';
import { createMemoryHistory, createRouter } from 'vue-router';
import { describe, expect, it } from 'vitest';
import { getMenusByAuthRoutes } from './route';

const page = { template: '<div />' };

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: page,
    meta: { title: 'Root', hideInMenu: true },
    children: [
      {
        path: 'home',
        name: 'home',
        component: page,
        meta: { title: 'Home', i18nKey: 'route.home' }
      },
      {
        path: 'hidden',
        name: 'hidden-page',
        component: page,
        meta: { title: 'Hidden', hideInMenu: true }
      }
    ]
  },
  {
    path: '/empty-group',
    name: 'empty-group',
    redirect: '/empty-group/child',
    meta: { title: 'Empty group' },
    children: [
      {
        path: 'child',
        name: 'empty-group-child',
        component: page,
        meta: { title: 'Hidden child', hideInMenu: true }
      }
    ]
  }
];

describe('getMenusByAuthRoutes', () => {
  it('omits hideInMenu items and does not leave empty parent shells', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes
    });
    const menus = getMenusByAuthRoutes(routes, router);

    expect(menus.map(menu => menu.key)).toEqual(['home']);
    expect(menus.some(menu => menu.key === 'root' || menu.key === 'empty-group' || menu.key === 'hidden-page')).toBe(
      false
    );
  });
});
