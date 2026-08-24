import type { App } from 'vue';
import { createPinia } from 'pinia';
import { resetSetupStore } from './plugins/reset';

export * from './app';
export * from './auth';
export * from './ids';
export * from './route';
export * from './tab';
export * from './theme';

export const pinia = createPinia();

pinia.use(resetSetupStore);

export function setupStore(app: App) {
  app.use(pinia);
}
