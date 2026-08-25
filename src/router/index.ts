import type { App } from 'vue';
import {
  type RouterHistory,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router';
import { createRouterGuard } from './guards';
import { routes } from './routes';

const historyCreatorMap: Record<ImportMetaEnv['VITE_ROUTER_HISTORY_MODE'], (base?: string) => RouterHistory> = {
  hash: createWebHashHistory,
  history: createWebHistory,
  memory: createMemoryHistory
};

const history = historyCreatorMap[import.meta.env.VITE_ROUTER_HISTORY_MODE](import.meta.env.BASE_URL);

export const router = createRouter({
  history,
  routes
});

export async function setupRouter(app: App) {
  createRouterGuard(router);
  app.use(router);
  await router.isReady();
}
