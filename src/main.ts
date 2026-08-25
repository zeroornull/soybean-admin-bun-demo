import { createApp } from 'vue';
import { setupI18n } from './locales';
import { setupAppVersionNotification, setupLoading } from './plugins';
import { router, setupRouter } from './router';
import { setupStore } from './store';
import { useAppStore } from './store/app';
import { setAuthNavigator } from './store/auth';
import App from './App.vue';
import './plugins/assets';

async function setupApp() {
  setupLoading();

  const app = createApp(App);

  setupStore(app);
  await setupRouter(app);

  setAuthNavigator(async () => {
    const currentRoute = router.currentRoute.value;

    if (currentRoute.name === 'login') return;

    const query = currentRoute.meta.requiresAuth ? { redirect: currentRoute.fullPath } : undefined;
    await router.replace({ name: 'login', query });
  });

  setupI18n(app);

  app.mount('#app');

  setupAppVersionNotification({
    enabled: import.meta.env.PROD && import.meta.env.VITE_AUTOMATICALLY_DETECT_UPDATE === 'Y',
    currentBuildTime: BUILD_TIME,
    baseUrl: import.meta.env.VITE_BASE_URL || '/',
    onUpdate: () => useAppStore().markUpdateAvailable()
  });
}

void setupApp();
