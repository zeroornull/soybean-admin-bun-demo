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

  const appStore = useAppStore(pinia);
  useThemeStore(pinia);
  const authStore = useAuthStore(pinia);
  const resetSession = (reason: string) => authStore.resetStore({ reason });

  setRequestSessionHandlers({
    onLogout: error => resetSession(error.message),
    onModalLogout: async error => {
      await appStore.handleModalLogout(error.message, () => resetSession(error.message));
    },
    onTokenExpired: error => resetSession(error.message),
    refreshSession: () => authStore.refreshSession()
  });
}
