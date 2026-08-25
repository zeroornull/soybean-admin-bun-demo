import { FIRST_LEVEL_ROUTE_COMPONENT_SPLIT, LAYOUT_PREFIX, VIEW_PREFIX, elegantRouterConfig } from './config';
import type { ElegantConstRoute, RouteTreeNode } from './types';

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}

function defaultMeta(routeName: string) {
  const constant = elegantRouterConfig.constantNames.includes(routeName);

  return omitUndefined({
    title: routeName,
    i18nKey: `route.${routeName}`,
    constant: constant || undefined,
    hideInMenu: constant || undefined,
    hideInTab: constant || undefined,
    requiresAuth: constant ? undefined : true
  });
}

function layoutOf(routeName: string) {
  const override = elegantRouterConfig.overrides[routeName];
  return override?.layout || elegantRouterConfig.layoutByName[routeName] || elegantRouterConfig.defaultLayout;
}

function componentOf(node: RouteTreeNode, isFirstLevel: boolean, hasChildren: boolean) {
  const layout = layoutOf(node.routeName);

  if (hasChildren) return isFirstLevel ? `${LAYOUT_PREFIX}${layout}` : undefined;
  if (isFirstLevel) {
    return `${LAYOUT_PREFIX}${layout}${FIRST_LEVEL_ROUTE_COMPONENT_SPLIT}${VIEW_PREFIX}${node.routeName}`;
  }

  return `${VIEW_PREFIX}${node.routeName}`;
}

export function treesToElegantRoutes(trees: RouteTreeNode[]): ElegantConstRoute[] {
  function convert(node: RouteTreeNode, isFirstLevel: boolean): ElegantConstRoute {
    const override = elegantRouterConfig.overrides[node.routeName] ?? {};
    const children = node.children?.map(child => convert(child, false));
    const hasChildren = Boolean(children?.length);
    const generatedMeta = defaultMeta(node.routeName);
    const path = override.path ?? node.routePath;
    const route: ElegantConstRoute = {
      name: override.name ?? node.routeName,
      path,
      meta: {
        ...generatedMeta,
        ...override.meta
      }
    };
    const component = componentOf(node, isFirstLevel, hasChildren);

    if (component) route.component = component;
    if (children?.length) route.children = children;
    if (path.includes(':')) route.props = true;

    return route;
  }

  return trees.map(tree => convert(tree, true)).sort((current, next) => current.name.localeCompare(next.name));
}

export function createNotFoundRoute(): ElegantConstRoute {
  const { notFound } = elegantRouterConfig;

  return {
    name: notFound.name,
    path: notFound.path,
    component: `${LAYOUT_PREFIX}${notFound.layout}${FIRST_LEVEL_ROUTE_COMPONENT_SPLIT}${VIEW_PREFIX}${notFound.view}`,
    meta: {
      title: '页面不存在',
      i18nKey: 'route.notFound',
      constant: true,
      hideInMenu: true,
      hideInTab: true
    }
  };
}
