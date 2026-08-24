import { createApp } from 'vue';
import { setupLoading } from './plugins';
import App from './App.vue';
import './plugins/assets';

async function setupApp() {
  setupLoading();

  const app = createApp(App);

  // R06: setupStore(app)
  // R04: await setupRouter(app)
  // R13: setupI18n(app)

  app.mount('#app');
}

void setupApp();
