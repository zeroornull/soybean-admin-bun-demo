import type { App } from 'vue';
import { createPinia } from 'pinia';
import { setRequestSessionHandlers } from '@/service/request';
import { useAppStore } from './app';
import { useAuthStore } from './auth';
import { useThemeStore } from './theme';
import { resetSetupStore } from './plugins/reset';

export const pinia = createPinia();

pinia.use(resetSetupStore);

export function setupStore(app: App) {
  app.use(pinia);

  useAppStore(pinia);
  useThemeStore(pinia);
  const authStore = useAuthStore(pinia);
  const resetSession = (reason: string) => authStore.resetStore({ reason });

  setRequestSessionHandlers({
    onLogout: error => resetSession(error.message),
    onModalLogout: error => resetSession(error.message),
    onTokenExpired: error => resetSession(error.message)
  });
}
