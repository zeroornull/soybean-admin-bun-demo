import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { RouteRecordRaw, Router } from 'vue-router';
import { authRoutes } from '@/router/routes';
import { SetupStoreId } from './ids';

export interface MenuItem {
  key: string;
  label: string;
  path: string;
  children?: MenuItem[];
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

/** Visible route and menu projection state; R10/R11 will populate it. */
export const useRouteStore = defineStore(SetupStoreId.Route, () => {
  const menus = ref<MenuItem[]>([]);
  const isConstantRouteInitialized = ref(false);
  const isAuthRouteInitialized = ref(false);
  const authorizedRouteNames = ref<string[]>([]);

  let removeRouteFns: Array<() => void> = [];

  function initConstantRoute() {
    isConstantRouteInitialized.value = true;
  }

  function removeAuthRoutes() {
    removeRouteFns.forEach(removeRoute => removeRoute());
    removeRouteFns = [];
  }

  function initAuthRoute(roles: string[], targetRouter: Router) {
    if (import.meta.env.VITE_AUTH_ROUTE_MODE !== 'static') {
      throw new Error('Dynamic auth route mode is not implemented in the main learning path');
    }

    removeAuthRoutes();

    const filteredRoutes = filterAuthRoutesByRoles(authRoutes, roles, import.meta.env.VITE_STATIC_SUPER_ROLE);

    filteredRoutes.forEach(route => {
      removeRouteFns.push(targetRouter.addRoute(route));
    });

    authorizedRouteNames.value = collectRouteNames(filteredRoutes);
    isAuthRouteInitialized.value = true;

    return filteredRoutes;
  }

  function resetStore() {
    removeAuthRoutes();
    isAuthRouteInitialized.value = false;
    authorizedRouteNames.value = [];
    menus.value = [];
  }

  return {
    menus,
    isConstantRouteInitialized,
    isAuthRouteInitialized,
    authorizedRouteNames,
    initConstantRoute,
    initAuthRoute,
    resetStore
  };
});
