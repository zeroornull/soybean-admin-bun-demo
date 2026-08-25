import { describe, expect, it } from 'vitest';
import { mapBackendRoutesToVue, type BackendRoute } from './map-backend-routes';

describe('mapBackendRoutesToVue', () => {
  it('maps whitelisted component keys onto Vue route records', () => {
    const backend: BackendRoute[] = [
      {
        name: 'root',
        path: '/',
        component: 'layout.base',
        redirect: '/home',
        meta: { title: '', hideInMenu: true, requiresAuth: true },
        children: [
          {
            name: 'home',
            path: 'home',
            component: 'home',
            meta: { title: '首页', i18nKey: 'route.home', componentName: 'Home', keepAlive: true }
          }
        ]
      }
    ];
    const mapped = mapBackendRoutesToVue(backend);

    expect(mapped).toHaveLength(1);
    expect(mapped[0]?.name).toBe('root');
    expect(typeof mapped[0]?.component).toBe('function');
    expect(mapped[0]?.redirect).toBe('/home');
    expect(mapped[0]?.children?.[0]?.name).toBe('home');
    expect(typeof mapped[0]?.children?.[0]?.component).toBe('function');
  });

  it('drops unknown component keys instead of importing arbitrary paths', () => {
    const backend: BackendRoute[] = [
      {
        name: 'evil',
        path: '/evil',
        component: '../../etc/passwd',
        meta: { title: 'Evil' }
      },
      {
        name: 'home',
        path: 'home',
        component: 'home',
        meta: { title: 'Home' }
      }
    ];
    const mapped = mapBackendRoutesToVue(backend);

    expect(mapped.map(route => route.name)).toEqual(['home']);
  });
});
