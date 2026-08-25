import type { Plugin } from 'vite';
import { injectLocalComponentImports } from '../src/utils/local-components.ts';

export function localComponentsPlugin(): Plugin {
  return {
    name: 'local-components-auto-import',
    enforce: 'pre',
    transform(code, id) {
      const file = id.split('?')[0] || id;
      if (!file.endsWith('.vue') || file.includes('node_modules')) return undefined;

      const next = injectLocalComponentImports(code);
      if (next === code) return undefined;

      return { code: next, map: null };
    }
  };
}
