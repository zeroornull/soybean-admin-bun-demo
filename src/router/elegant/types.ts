import type { RouteMeta, RouteRecordRaw } from 'vue-router';

/** File-convention route before it is turned into vue-router records. */
export interface ElegantConstRoute {
  name: string;
  path: string;
  component?: string;
  redirect?: RouteRecordRaw['redirect'];
  props?: RouteRecordRaw['props'];
  meta?: Partial<RouteMeta>;
  children?: ElegantConstRoute[];
}

export interface PageFile {
  glob: string;
  importPath: string;
  routeName: string;
  routePath: string;
  routeParamKey: string;
}

export interface RouteTreeNode {
  routeName: string;
  routePath: string;
  children?: RouteTreeNode[];
}

export interface RouteOverride {
  name?: string;
  path?: string;
  layout?: string;
  meta?: Partial<RouteMeta>;
}
