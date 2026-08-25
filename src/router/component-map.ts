export const routeComponentMap = {
  'layout.base': () => import('@/layouts/base-layout.vue'),
  home: () => import('@/views/home/index.vue'),
  restricted: () => import('@/views/restricted/index.vue')
} as const;

export type RouteComponentKey = keyof typeof routeComponentMap;

export function isRouteComponentKey(value: string): value is RouteComponentKey {
  return value in routeComponentMap;
}
