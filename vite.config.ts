import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { normalizePublicBase } from './src/utils/public-base.ts';

const proxyPrefix = '/proxy-default';

export function createSrcAlias() {
  return {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyEnabled = env.VITE_HTTP_PROXY === 'Y';
  const publicBase = normalizePublicBase(env.VITE_BASE_URL);

  return {
    plugins: [vue(), UnoCSS()],
    base: publicBase,
    build: {
      sourcemap: false
    },
    resolve: {
      alias: createSrcAlias()
    },
    test: {
      environment: 'node',
      include: ['src/**/*.spec.ts', 'packages/*/src/**/*.spec.ts'],
      restoreMocks: true,
      unstubGlobals: true
    },
    server: {
      host: '0.0.0.0',
      port: 19528,
      proxy: proxyEnabled
        ? {
            [proxyPrefix]: {
              target: env.VITE_SERVICE_BASE_URL,
              changeOrigin: true,
              rewrite: path => path.replace(new RegExp(`^${proxyPrefix}`), '')
            }
          }
        : undefined
    },
    preview: {
      port: 19726
    }
  };
});
