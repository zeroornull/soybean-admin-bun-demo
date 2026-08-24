import { createApp } from 'vue';
import { setupLoading } from './plugins';
import { router, setupRouter } from './router';
import { setupStore } from './store';
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

  // R13: setupI18n(app)

  app.mount('#app');
}

void setupApp();
