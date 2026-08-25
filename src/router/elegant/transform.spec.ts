import { describe, expect, it, vi } from 'vitest';
import { transformElegantRoutesToVueRoutes } from './transform';
import type { ElegantConstRoute } from './types';

const layouts = {
  base: () => Promise.resolve({} as never),
  blank: () => Promise.resolve({} as never)
};

const views = {
  home: () => Promise.resolve({} as never),
  '403': () => Promise.resolve({} as never),
  user_detail: () => Promise.resolve({} as never)
};

describe('transformElegantRoutesToVueRoutes', () => {
  it('wraps layout.x$view.y as a layout parent with an empty-path child', () => {
    const routes: ElegantConstRoute[] = [
      {
        name: 'home',
        path: '/home',
        component: 'layout.base$view.home',
        meta: { title: '首页', i18nKey: 'route.home', keepAlive: true }
      }
    ];
    const [record] = transformElegantRoutesToVueRoutes(routes, layouts, views);

    expect(record?.path).toBe('/home');
    expect(record?.component).toBe(layouts.base);
    expect(record?.name).toBeUndefined();
    expect(record?.children).toHaveLength(1);
    expect(record?.children?.[0]).toMatchObject({
      name: 'home',
      path: '',
      component: views.home,
      meta: { title: '首页', i18nKey: 'route.home', keepAlive: true }
    });
  });

  it('keeps view.x children under a layout.x parent instead of wrapping them again', () => {
    const routes: ElegantConstRoute[] = [
      {
        name: 'root',
        path: '/',
        component: 'layout.base',
        meta: { title: '', hideInMenu: true },
        children: [
          {
            name: 'home',
            path: 'home',
            component: 'view.home',
            meta: { title: '首页' }
          }
        ]
      }
    ];
    const [record] = transformElegantRoutesToVueRoutes(routes, layouts, views);

    expect(record?.name).toBe('root');
    expect(record?.component).toBe(layouts.base);
    expect(record?.children?.[0]).toMatchObject({
      name: 'home',
      path: 'home',
      component: views.home
    });
  });

  it('nests underscore children under the first-level layout', () => {
    const routes: ElegantConstRoute[] = [
      {
        name: 'user',
        path: '/user',
        component: 'layout.base',
        children: [
          {
            name: 'user_detail',
            path: '/user/detail',
            component: 'view.user_detail',
            meta: { title: 'Detail' }
          }
        ]
      }
    ];
    const [record] = transformElegantRoutesToVueRoutes(routes, layouts, views);

    expect(record?.name).toBe('user');
    expect(record?.redirect).toEqual({ name: 'user_detail' });
    expect(record?.children?.map(child => child.name)).toEqual(['user_detail']);
    expect(record?.children?.[0]?.component).toBe(views.user_detail);
  });

  it('drops routes whose layout or view is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const mapped = transformElegantRoutesToVueRoutes(
      [{ name: 'ghost', path: '/ghost', component: 'layout.missing$view.home' }],
      layouts,
      views
    );

    expect(mapped).toEqual([]);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
