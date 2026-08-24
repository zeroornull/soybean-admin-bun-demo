import type { App } from 'vue';
import {
  type RouterHistory,
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from 'vue-router';
import { routes } from './routes';

const historyCreatorMap: Record<ImportMetaEnv['VITE_ROUTER_HISTORY_MODE'], (base?: string) => RouterHistory> = {
  hash: createWebHashHistory,
  history: createWebHistory,
  memory: createMemoryHistory
};

const history = historyCreatorMap[import.meta.env.VITE_ROUTER_HISTORY_MODE](import.meta.env.VITE_BASE_URL);

export const router = createRouter({
  history,
  routes
});

export async function setupRouter(app: App) {
  app.use(router);
  await router.isReady();
}
