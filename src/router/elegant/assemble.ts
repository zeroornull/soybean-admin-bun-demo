import { FIRST_LEVEL_ROUTE_COMPONENT_SPLIT, LAYOUT_PREFIX, VIEW_PREFIX, elegantRouterConfig } from './config';
import type { ElegantConstRoute } from './types';

function layoutNameFromComponent(component: string | undefined) {
  if (!component?.includes(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT)) return null;
  const [layoutPart] = component.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT);
  if (!layoutPart?.startsWith(LAYOUT_PREFIX)) return null;
  return layoutPart.slice(LAYOUT_PREFIX.length);
}

function viewNameFromComponent(component: string | undefined) {
  if (!component) return null;
  if (component.includes(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT)) {
    const viewPart = component.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT)[1];
    return viewPart?.startsWith(VIEW_PREFIX) ? viewPart.slice(VIEW_PREFIX.length) : null;
  }
  if (component.startsWith(VIEW_PREFIX)) return component.slice(VIEW_PREFIX.length);
  return null;
}

function toChildPath(path: string) {
  return path.replace(/^\//, '');
}

/**
 * Official Elegant Router wraps every first-level page in its own layout instance.
 * That remounts `BaseLayout` (and its KeepAlive) when switching `/home` and `/restricted`.
 * Group same-layout auth pages under one `root` so R12 cache still works.
 */
export function groupAuthElegantRoutes(
  routes: ElegantConstRoute[],
  homeName = elegantRouterConfig.homeName
): ElegantConstRoute[] {
  const grouped: ElegantConstRoute[] = [];
  const rest: ElegantConstRoute[] = [];
  const pagesByLayout = new Map<string, ElegantConstRoute[]>();

  routes.forEach(route => {
    const layout = layoutNameFromComponent(route.component);

    if (layout && layout === elegantRouterConfig.defaultLayout && !route.children?.length) {
      const pages = pagesByLayout.get(layout) ?? [];
      pages.push(route);
      pagesByLayout.set(layout, pages);
      return;
    }

    rest.push(route);
  });

  pagesByLayout.forEach((pages, layout) => {
    const ordered = [...pages].sort((current, next) => {
      const orderDifference =
        (current.meta?.order ?? Number.MAX_SAFE_INTEGER) - (next.meta?.order ?? Number.MAX_SAFE_INTEGER);
      return orderDifference || current.name.localeCompare(next.name);
    });
    const home = ordered.find(page => page.name === homeName) ?? ordered[0];

    grouped.push({
      name: 'root',
      path: '/',
      component: `${LAYOUT_PREFIX}${layout}`,
      redirect: home ? { name: home.name } : undefined,
      meta: {
        title: '',
        hideInMenu: true,
        requiresAuth: true
      },
      children: ordered.map(page => {
        const view = viewNameFromComponent(page.component);
        const child: ElegantConstRoute = {
          ...page,
          path: toChildPath(page.path)
        };

        if (view) child.component = `${VIEW_PREFIX}${view}`;
        return child;
      })
    });
  });

  return [...grouped, ...rest];
}

export function splitGeneratedRoutes(routes: ElegantConstRoute[]) {
  const constantRoutes: ElegantConstRoute[] = [];
  const authRoutes: ElegantConstRoute[] = [];

  routes.forEach(route => {
    if (route.meta?.constant) constantRoutes.push(route);
    else authRoutes.push(route);
  });

  return { constantRoutes, authRoutes };
}
