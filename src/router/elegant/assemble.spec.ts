import { describe, expect, it } from 'vitest';
import { groupAuthElegantRoutes, splitGeneratedRoutes } from './assemble';
import type { ElegantConstRoute } from './types';

describe('groupAuthElegantRoutes', () => {
  it('groups first-level base pages under one root with relative child paths', () => {
    const routes: ElegantConstRoute[] = [
      {
        name: 'restricted',
        path: '/restricted',
        component: 'layout.base$view.restricted',
        meta: { title: '受限页', order: 20, roles: ['R_NOBODY'] }
      },
      {
        name: 'home',
        path: '/home',
        component: 'layout.base$view.home',
        meta: { title: '首页', order: 1 }
      }
    ];
    const [root] = groupAuthElegantRoutes(routes);

    expect(root).toMatchObject({
      name: 'root',
      path: '/',
      component: 'layout.base',
      redirect: { name: 'home' }
    });
    expect(root?.children?.map(child => [child.name, child.path, child.component])).toEqual([
      ['home', 'home', 'view.home'],
      ['restricted', 'restricted', 'view.restricted']
    ]);
  });
});

describe('splitGeneratedRoutes', () => {
  it('splits constant pages away from auth pages', () => {
    const { constantRoutes, authRoutes } = splitGeneratedRoutes([
      { name: 'login', path: '/login', meta: { title: '登录', constant: true } },
      { name: 'home', path: '/home', meta: { title: '首页' } }
    ]);

    expect(constantRoutes.map(route => route.name)).toEqual(['login']);
    expect(authRoutes.map(route => route.name)).toEqual(['home']);
  });
});
