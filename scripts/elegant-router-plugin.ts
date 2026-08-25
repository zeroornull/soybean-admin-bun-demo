import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';

function isSourcePath(file: string) {
  const normalized = file.replaceAll('\\', '/');

  if (normalized.endsWith('/src/router/elegant/imports.ts') || normalized.endsWith('/src/router/elegant/routes.ts')) {
    return false;
  }

  return (
    normalized.includes('/src/views/') ||
    normalized.endsWith('/src/layouts/base-layout.vue') ||
    normalized.endsWith('/src/layouts/blank-layout.vue') ||
    normalized.endsWith('/src/router/elegant/config.ts')
  );
}

function generate() {
  const result = spawnSync('bun', ['scripts/gen-routes.ts'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  if (result.status) {
    throw new Error(`elegant-router generation failed with status ${result.status}`);
  }
}

export function elegantRouterPlugin(): Plugin {
  return {
    name: 'elegant-router',
    buildStart() {
      if (process.env.VITEST) return;
      generate();
    },
    configureServer(server) {
      if (process.env.VITEST) return;

      const root = server.config.root || process.cwd();
      server.watcher.add([
        resolve(root, 'src/views'),
        resolve(root, 'src/layouts'),
        resolve(root, 'src/router/elegant/config.ts')
      ]);

      server.watcher.on('all', (_event, file) => {
        if (!isSourcePath(file)) return;
        generate();
      });
    }
  };
}
