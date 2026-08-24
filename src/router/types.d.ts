import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    constant?: boolean;
    hideInMenu?: boolean;
    requiresAuth?: boolean;
    roles?: string[];
    title?: string;
  }
}

export {};
