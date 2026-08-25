import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { buildSvgSprite, defaultSvgIconPrefix, svgIconDomId, svgIconVirtualId } from '../src/utils/svg-sprite.ts';

const resolvedVirtualId = `\0${svgIconVirtualId}`;

function readSvgFiles(dir: string) {
  if (!existsSync(dir)) return [];

  return readdirSync(dir)
    .filter(name => name.endsWith('.svg'))
    .sort((current, next) => current.localeCompare(next))
    .map(name => ({
      name,
      content: readFileSync(join(dir, name), 'utf8')
    }));
}

export function svgIconsPlugin(options: { dir: string; prefix?: string; customDomId?: string }): Plugin {
  const prefix = options.prefix || defaultSvgIconPrefix;
  const customDomId = options.customDomId || svgIconDomId;

  function loadRegisterModule() {
    const sprite = buildSvgSprite(readSvgFiles(options.dir), prefix, customDomId);

    return `export function registerSvgIcons() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(${JSON.stringify(customDomId)})) return;
  const host = document.createElement('div');
  host.innerHTML = ${JSON.stringify(sprite)};
  const svg = host.querySelector('svg');
  if (!svg) return;
  svg.style.position = 'absolute';
  svg.style.width = '0';
  svg.style.height = '0';
  svg.style.overflow = 'hidden';
  document.body.append(svg);
}

registerSvgIcons();
`;
  }

  return {
    name: 'svg-icons',
    resolveId(id) {
      if (id === svgIconVirtualId) return resolvedVirtualId;
      return undefined;
    },
    load(id) {
      if (id !== resolvedVirtualId) return undefined;
      return loadRegisterModule();
    },
    configureServer(server) {
      server.watcher.add(options.dir);
      server.watcher.on('all', (_event, file) => {
        if (!file.replaceAll('\\', '/').includes('/svg-icon/')) return;
        const mod = server.moduleGraph.getModuleById(resolvedVirtualId);
        if (mod) void server.reloadModule(mod);
      });
    }
  };
}
