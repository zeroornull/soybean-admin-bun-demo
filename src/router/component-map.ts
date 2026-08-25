import { layouts, views } from './elegant/imports';

/** Backend dynamic-route whitelist. Generated views are not automatically trusted. */
export const routeComponentMap = {
  'layout.base': layouts.base,
  home: views.home,
  restricted: views.restricted,
  'iframe-page': views['iframe-page']
} as const;

export type RouteComponentKey = keyof typeof routeComponentMap;

export function isRouteComponentKey(value: string): value is RouteComponentKey {
  return value in routeComponentMap;
}
