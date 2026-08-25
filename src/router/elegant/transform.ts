import type { RouteComponent, RouteRecordRaw } from 'vue-router';
import { FIRST_LEVEL_ROUTE_COMPONENT_SPLIT, LAYOUT_PREFIX, PAGE_DEGREE_SPLITTER, VIEW_PREFIX } from './config';
import type { ElegantConstRoute } from './types';

type ComponentMap = Record<string, RouteComponent | (() => Promise<RouteComponent>)>;

function isFirstLevelRoute(route: ElegantConstRoute) {
  return !route.name.includes(PAGE_DEGREE_SPLITTER);
}

function isSingleLevelRoute(route: ElegantConstRoute) {
  return Boolean(route.component?.includes(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT)) && !route.children?.length;
}

function transformElegantRouteToVueRoute(
  route: ElegantConstRoute,
  layouts: ComponentMap,
  views: ComponentMap
): RouteRecordRaw[] {
  function getLayoutName(component: string) {
    const layout = component.replace(LAYOUT_PREFIX, '');

    if (!layouts[layout]) {
      throw new Error(`Layout component "${layout}" not found`);
    }

    return layout;
  }

  function getViewName(component: string) {
    const view = component.replace(VIEW_PREFIX, '');

    if (!views[view]) {
      throw new Error(`View component "${view}" not found`);
    }

    return view;
  }

  const props = route.path.includes(':') && route.props === undefined ? true : route.props;
  const { name, path, component, children, ...rest } = route;
  const vueRoute = { name, path, ...(props !== undefined ? { props } : {}), ...rest } as RouteRecordRaw;

  try {
    if (component) {
      if (isSingleLevelRoute(route)) {
        const [layoutPart, viewPart] = component.split(FIRST_LEVEL_ROUTE_COMPONENT_SPLIT);
        const layout = getLayoutName(layoutPart || '');
        const view = getViewName(viewPart || '');

        return [
          {
            path,
            component: layouts[layout],
            meta: {
              title: route.meta?.title || ''
            },
            children: [
              {
                name,
                path: '',
                component: views[view],
                ...(props !== undefined ? { props } : {}),
                ...rest
              } as RouteRecordRaw
            ]
          }
        ];
      }

      if (component.startsWith(LAYOUT_PREFIX)) {
        vueRoute.component = layouts[getLayoutName(component)];
      }

      if (component.startsWith(VIEW_PREFIX)) {
        vueRoute.component = views[getViewName(component)];
      }
    }
  } catch (error) {
    console.error(`Error transforming route "${route.name}": ${String(error)}`);
    return [];
  }

  if (children?.length && !vueRoute.redirect) {
    vueRoute.redirect = { name: children[0]!.name };
  }

  const vueRoutes: RouteRecordRaw[] = [];

  if (children?.length) {
    const childRoutes = children.flatMap(child => transformElegantRouteToVueRoute(child, layouts, views));

    if (isFirstLevelRoute(route)) {
      vueRoute.children = childRoutes;
    } else {
      vueRoutes.push(...childRoutes);
    }
  }

  vueRoutes.unshift(vueRoute);

  return vueRoutes;
}

export function transformElegantRoutesToVueRoutes(
  routes: ElegantConstRoute[],
  layouts: ComponentMap,
  views: ComponentMap
) {
  return routes.flatMap(route => transformElegantRouteToVueRoute(route, layouts, views));
}
