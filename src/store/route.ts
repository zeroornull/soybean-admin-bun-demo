import { computed, ref, shallowRef } from 'vue';
import { defineStore } from 'pinia';
import type { RouteLocationNormalizedLoaded, RouteRecordRaw, Router } from 'vue-router';
import { mapBackendRoutesToVue } from '@/router/map-backend-routes';
import { authRoutes } from '@/router/routes';
import { fetchGetUserRoutes } from '@/service/api';
import { SetupStoreId } from './ids';

export interface MenuItem {
  key: string;
  label: string;
  i18nKey?: string;
  icon?: string;
  path: string;
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  key: string;
  label: string;
  i18nKey?: string;
  path: string;
}

export function hasRoutePermission(route: Pick<RouteRecordRaw, 'meta'>, roles: string[], superRole: string) {
  if (roles.includes(superRole)) return true;

  const routeRoles = route.meta?.roles || [];

  return !routeRoles.length || routeRoles.some(role => roles.includes(role));
}

export function filterAuthRoutesByRoles(routes: RouteRecordRaw[], roles: string[], superRole: string) {
  return routes.flatMap(route => {
    if (!hasRoutePermission(route, roles, superRole)) return [];

    const filteredRoute: RouteRecordRaw = { ...route };

    if (route.children) {
      const children = filterAuthRoutesByRoles(route.children, roles, superRole);

      if (!children.length) return [];

      filteredRoute.children = children;
    }

    return [filteredRoute];
  });
}

function collectRouteNames(routes: RouteRecordRaw[]) {
  const names: string[] = [];

  routes.forEach(route => {
    if (route.name) names.push(String(route.name));
    if (route.children) names.push(...collectRouteNames(route.children));
  });

  return names;
}

function sortRoutesByOrder(routes: RouteRecordRaw[]) {
  return routes
    .map((route, index) => ({ route, index }))
    .sort((current, next) => {
      const currentOrder = current.route.meta?.order ?? Number.MAX_SAFE_INTEGER;
      const nextOrder = next.route.meta?.order ?? Number.MAX_SAFE_INTEGER;
      const orderDifference = currentOrder - nextOrder;

      return orderDifference || current.index - next.index;
    })
    .map(item => item.route);
}

function getRouteLabel(route: RouteRecordRaw) {
  return route.meta?.title || route.meta?.i18nKey || '';
}

function getNormalizedRoutePaths(targetRouter: Router) {
  return new Map(
    targetRouter
      .getRoutes()
      .filter(route => route.name)
      .map(route => [String(route.name), route.path])
  );
}

function projectRoutesToMenus(routes: RouteRecordRaw[], pathsByName: Map<string, string>): MenuItem[] {
  return sortRoutesByOrder(routes).flatMap(route => {
    const children = route.children ? projectRoutesToMenus(route.children, pathsByName) : [];

    // A hidden layout shell does not become a menu item, but its visible business children are promoted.
    if (route.meta?.hideInMenu) return children;

    const key = route.name ? String(route.name) : '';
    const label = getRouteLabel(route);
    const path = pathsByName.get(key);

    if (!key || !label || !path) return children;

    if (children.length) {
      return [
        {
          key,
          label,
          path,
          i18nKey: route.meta?.i18nKey,
          icon: route.meta?.icon,
          children
        }
      ];
    }

    // Do not keep an empty grouping shell after every child has been projected away.
    if (route.children?.length && (!route.component || route.redirect)) return [];

    return [
      {
        key,
        label,
        path,
        i18nKey: route.meta?.i18nKey,
        icon: route.meta?.icon
      }
    ];
  });
}

export function getMenusByAuthRoutes(routes: RouteRecordRaw[], targetRouter: Router) {
  return projectRoutesToMenus(routes, getNormalizedRoutePaths(targetRouter));
}

function collectMenuKeys(menus: MenuItem[]) {
  const keys = new Set<string>();

  menus.forEach(menu => {
    keys.add(menu.key);
    if (menu.children) collectMenuKeys(menu.children).forEach(key => keys.add(key));
  });

  return keys;
}

export function getSelectedMenuKey(route: RouteLocationNormalizedLoaded, menus: MenuItem[]) {
  const menuKeys = collectMenuKeys(menus);

  for (const record of [...route.matched].reverse()) {
    const key = record.name ? String(record.name) : '';
    if (menuKeys.has(key)) return key;
  }

  return null;
}

export function getBreadcrumbsByRoute(route: RouteLocationNormalizedLoaded, targetRouter?: Router) {
  const breadcrumbs: BreadcrumbItem[] = [];

  route.matched.forEach(record => {
    const key = record.name ? String(record.name) : '';
    const label = record.meta.title || record.meta.i18nKey || '';

    if (!key || !label || breadcrumbs.some(item => item.key === key)) return;

    let path = record.path;

    if (targetRouter) {
      try {
        path = targetRouter.resolve({ name: record.name!, params: route.params }).path;
      } catch {
        // Keep the normalized route-record path when required dynamic params are unavailable.
      }
    }

    breadcrumbs.push({
      key,
      label,
      path,
      i18nKey: record.meta.i18nKey
    });
  });

  return breadcrumbs;
}

/** Authorized routes and their menu/breadcrumb projections. */
export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const menus = ref<MenuItem[]>([]);
  const currentRoute = shallowRef<RouteLocationNormalizedLoaded | null>(null);
  const isConstantRouteInitialized = ref(false);
  const isAuthRouteInitialized = ref(false);
  const authorizedRouteNames = ref<string[]>([]);
  const selectedMenuKey = computed(() =>
    currentRoute.value ? getSelectedMenuKey(currentRoute.value, menus.value) : null
  );
  const breadcrumbs = computed(() =>
    currentRoute.value ? getBreadcrumbsByRoute(currentRoute.value, activeRouter) : []
  );

  let removeRouteFns: Array<() => void> = [];
  let activeRouter: Router | undefined;

  function initConstantRoute() {
    isConstantRouteInitialized.value = true;
  }

  function removeAuthRoutes() {
    removeRouteFns.forEach(removeRoute => removeRoute());
    removeRouteFns = [];
  }

  async function initAuthRoute(roles: string[], targetRouter: Router) {
    removeAuthRoutes();

    let nextRoutes: RouteRecordRaw[] = [];

    if (import.meta.env.VITE_AUTH_ROUTE_MODE === 'dynamic') {
      const { data, error } = await fetchGetUserRoutes();

      if (error || !data) return false;

      nextRoutes = mapBackendRoutesToVue(data.routes);
    } else {
      nextRoutes = filterAuthRoutesByRoles(authRoutes, roles, import.meta.env.VITE_STATIC_SUPER_ROLE);
    }

    nextRoutes.forEach(route => {
      removeRouteFns.push(targetRouter.addRoute(route));
    });

    activeRouter = targetRouter;
    menus.value = getMenusByAuthRoutes(nextRoutes, targetRouter);
    authorizedRouteNames.value = collectRouteNames(nextRoutes);
    isAuthRouteInitialized.value = true;

    return true;
  }

  function syncCurrentRoute(route: RouteLocationNormalizedLoaded) {
    currentRoute.value = route;
  }

  function resetStore() {
    removeAuthRoutes();
    isAuthRouteInitialized.value = false;
    authorizedRouteNames.value = [];
    menus.value = [];
    currentRoute.value = null;
    activeRouter = undefined;
  }

  return {
    menus,
    selectedMenuKey,
    breadcrumbs,
    isConstantRouteInitialized,
    isAuthRouteInitialized,
    authorizedRouteNames,
    initConstantRoute,
    initAuthRoute,
    syncCurrentRoute,
    resetStore
  };
});
