import type { App } from 'vue';
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';
import { routes } from './routes';

const history =
  import.meta.env.VITE_ROUTER_HISTORY_MODE === 'hash'
    ? createWebHashHistory(import.meta.env.VITE_BASE_URL)
    : createWebHistory(import.meta.env.VITE_BASE_URL);

export const router = createRouter({
  history,
  routes
});

export async function setupRouter(app: App) {
  app.use(router);
  await router.isReady();
}
