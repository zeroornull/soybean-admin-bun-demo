import { createApp } from 'vue';
import { setupLoading } from './plugins';
import { router, setupRouter } from './router';
import { pinia, setupStore } from './store';
import { useAuthStore } from './store/auth';
import App from './App.vue';
import './plugins/assets';

async function setupApp() {
  setupLoading();

  const app = createApp(App);

  setupStore(app);
  await setupRouter(app);

  const authStore = useAuthStore(pinia);
  await authStore.initSession();

  if (!authStore.isLogin && router.currentRoute.value.meta.requiresAuth) {
    await router.replace({
      name: 'login',
      query: { redirect: router.currentRoute.value.fullPath }
    });
  }

  // R13: setupI18n(app)

  app.mount('#app');
}

void setupApp();
