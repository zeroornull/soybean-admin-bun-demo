/// <reference types="vite/client" />

declare const BUILD_TIME: string;

declare module 'virtual:svg-icons-register';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<object, object, unknown>;
  export default component;
}
