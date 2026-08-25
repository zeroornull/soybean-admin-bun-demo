import type { RouteMeta, RouteRecordRaw } from 'vue-router';
import { isRouteComponentKey, routeComponentMap } from './component-map';

export interface BackendRoute {
  name: string;
  path: string;
  component?: string;
  redirect?: string | { name: string };
  meta?: Partial<RouteMeta>;
  children?: BackendRoute[];
}

function toRouteMeta(meta: BackendRoute['meta']): RouteMeta {
  return {
    title: meta?.title || '',
    i18nKey: meta?.i18nKey,
    icon: meta?.icon,
    order: meta?.order,
    hideInMenu: meta?.hideInMenu,
    hideInTab: meta?.hideInTab,
    keepAlive: meta?.keepAlive,
    componentName: meta?.componentName,
    pinned: meta?.pinned,
    constant: meta?.constant,
    requiresAuth: meta?.requiresAuth,
    roles: meta?.roles
  };
}

export function mapBackendRoutesToVue(routes: BackendRoute[]): RouteRecordRaw[] {
  return routes.flatMap(route => {
    const children = route.children?.length ? mapBackendRoutesToVue(route.children) : undefined;

    if (route.component && !isRouteComponentKey(route.component)) {
      return children || [];
    }

    if (!route.name || !route.path) return children || [];

    const record = {
      path: route.path,
      name: route.name,
      meta: toRouteMeta(route.meta)
    } as RouteRecordRaw;

    if (route.component && isRouteComponentKey(route.component)) {
      record.component = routeComponentMap[route.component];
    }

    if (route.redirect) record.redirect = route.redirect;
    if (children?.length) record.children = children;

    return [record];
  });
}
