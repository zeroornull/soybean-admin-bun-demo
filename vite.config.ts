import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { elegantRouterPlugin } from './scripts/elegant-router-plugin.ts';
import { htmlBuildTimePlugin } from './scripts/html-build-time-plugin.ts';
import { localComponentsPlugin } from './scripts/local-components-plugin.ts';
import { svgIconsPlugin } from './scripts/svg-icons-plugin.ts';
import { normalizePublicBase } from './src/utils/public-base.ts';
import { defaultSvgIconPrefix } from './src/utils/svg-sprite.ts';
import { getProxyTargets } from './src/utils/service.ts';

export function createSrcAlias() {
  return {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyEnabled = env.VITE_HTTP_PROXY === 'Y';
  const publicBase = normalizePublicBase(env.VITE_BASE_URL);
  const buildTime = new Date().toISOString();
  const srcDir = fileURLToPath(new URL('./src', import.meta.url));

  return {
    define: {
      BUILD_TIME: JSON.stringify(buildTime)
    },
    plugins: [
      vue(),
      UnoCSS(),
      elegantRouterPlugin(),
      localComponentsPlugin(),
      svgIconsPlugin({
        dir: `${srcDir}/assets/svg-icon`,
        prefix: env.VITE_ICON_LOCAL_PREFIX || defaultSvgIconPrefix
      }),
      htmlBuildTimePlugin(buildTime)
    ],
    base: publicBase,
    build: {
      sourcemap: false
    },
    resolve: {
      alias: createSrcAlias()
    },
    test: {
      environment: 'node',
      include: ['src/**/*.spec.ts', 'packages/*/src/**/*.spec.ts', 'scripts/**/*.spec.ts'],
      restoreMocks: true,
      unstubGlobals: true
    },
    server: {
      host: '0.0.0.0',
      port: 19528,
      proxy: proxyEnabled
        ? Object.fromEntries(
            getProxyTargets(env).map(({ prefix, target }) => [
              prefix,
              {
                target,
                changeOrigin: true,
                rewrite: (path: string) => path.replace(new RegExp(`^${prefix}`), '')
              }
            ])
          )
        : undefined
    },
    preview: {
      port: 19726
    }
  };
});
