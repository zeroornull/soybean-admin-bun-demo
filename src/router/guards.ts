import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router';
import { setDocumentTitle } from '@/locales';
import { fetchIsRouteExist } from '@/service/api';
import { useAuthStore } from '@/store/auth';
import { hasRoutePermission, useRouteStore } from '@/store/route';
import { useTabStore } from '@/store/tab';
import { authRoutes } from './routes';

function normalizePath(path: string) {
  if (path === '/') return path;
  return path.replace(/\/+$/, '');
}

function joinRoutePath(parentPath: string, routePath: string) {
  if (routePath.startsWith('/')) return normalizePath(routePath);
  return normalizePath(`${parentPath}/${routePath}`.replace(/\/+/g, '/'));
}

function collectAuthRoutePaths(routes = authRoutes, parentPath = ''): string[] {
  return routes.flatMap(route => {
    const path = joinRoutePath(parentPath, route.path);
    return [path, ...(route.children ? collectAuthRoutePaths(route.children, path) : [])];
  });
}

const authRoutePaths = new Set(collectAuthRoutePaths());

export function isAuthRoutePath(path: string) {
  return authRoutePaths.has(normalizePath(path));
}

async function isExistingAuthPath(path: string) {
  if (import.meta.env.VITE_AUTH_ROUTE_MODE !== 'dynamic') {
    return isAuthRoutePath(path);
  }

  const { data, error } = await fetchIsRouteExist(path);

  return !error && data === true;
}

function redirectToLogin(fullPath: string): RouteLocationRaw {
  return {
    name: 'login',
    query: { redirect: fullPath }
  };
}

function rematchRoute(to: RouteLocationNormalized): RouteLocationRaw {
  return {
    path: to.path,
    query: to.query,
    hash: to.hash,
    replace: true
  };
}

export function createRouterGuard(router: Router) {
  router.beforeEach(async to => {
    const authStore = useAuthStore();
    const routeStore = useRouteStore();

    if (!routeStore.isConstantRouteInitialized) {
      routeStore.initConstantRoute();
      return rematchRoute(to);
    }

    await authStore.initSession();

    const isNotFound = to.name === 'not-found';

    if (!authStore.isLogin) {
      if (to.name === 'login') return true;
      if (to.meta.constant && !isNotFound) return true;
      if (isNotFound && !(await isExistingAuthPath(to.path))) return true;
      return redirectToLogin(to.fullPath);
    }

    if (!routeStore.isAuthRouteInitialized) {
      const initialized = await routeStore.initAuthRoute(authStore.userInfo?.roles || [], router);

      if (!initialized) {
        await authStore.resetStore({ reason: 'Unable to load routes', redirect: false });
        return redirectToLogin(to.fullPath);
      }

      return rematchRoute(to);
    }

    if (to.name === 'login') {
      return { name: import.meta.env.VITE_ROUTE_HOME };
    }

    if (isNotFound && (await isExistingAuthPath(to.path))) {
      return { name: 'forbidden', replace: true };
    }

    if (to.meta.constant) return true;

    if (!hasRoutePermission(to, authStore.userInfo?.roles || [], import.meta.env.VITE_STATIC_SUPER_ROLE)) {
      return { name: 'forbidden', replace: true };
    }

    return true;
  });

  router.afterEach(to => {
    useRouteStore().syncCurrentRoute(to);
    useTabStore().syncRoute(to, router);

    setDocumentTitle(to.meta);
  });
}
