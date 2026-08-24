import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    i18nKey?: string;
    icon?: string;
    order?: number;
    hideInMenu?: boolean;
    hideInTab?: boolean;
    keepAlive?: boolean;
    componentName?: string;
    pinned?: boolean;
    constant?: boolean;
    requiresAuth?: boolean;
    roles?: string[];
  }
}

export {};
