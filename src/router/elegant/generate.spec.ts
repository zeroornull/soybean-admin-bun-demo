import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { groupAuthElegantRoutes, splitGeneratedRoutes } from './assemble';
import { buildGeneratedSources } from './generate';
import { layouts, views } from './imports';
import { generatedRoutes } from './routes';
import { createNotFoundRoute } from './to-const';
import { transformElegantRoutesToVueRoutes } from './transform';

describe('generated elegant routes', () => {
  it('keeps committed generated files in sync with src/views', () => {
    const sources = buildGeneratedSources();

    expect(readFileSync('src/router/elegant/imports.ts', 'utf8')).toBe(sources.imports);
    expect(readFileSync('src/router/elegant/routes.ts', 'utf8')).toBe(sources.routesSource);
  });

  it('maps current views onto Elegant Router names and layout$view components', () => {
    const byName = Object.fromEntries(generatedRoutes.map(route => [route.name, route]));

    expect(byName.login?.component).toBe('layout.blank$view.login');
    expect(byName.login?.path).toBe('/login/:module(pwd-login|code-login|register|reset-pwd|bind-wechat)?');
    expect(byName.forbidden?.component).toBe('layout.blank$view.403');
    expect(byName['not-found-page']?.path).toBe('/404');
    expect(byName['not-found-page']?.component).toBe('layout.blank$view.404');
    expect(byName['server-error']?.component).toBe('layout.blank$view.500');
    expect(byName.home).toMatchObject({
      path: '/home',
      component: 'layout.base$view.home',
      meta: { componentName: 'Home', keepAlive: true, pinned: true }
    });
    expect(byName.restricted?.meta?.roles).toEqual(['R_NOBODY']);
  });

  it('assembles a shared auth root so home and restricted keep the same layout instance', () => {
    const { constantRoutes, authRoutes } = splitGeneratedRoutes(generatedRoutes);
    const vueConstant = [
      ...transformElegantRoutesToVueRoutes(constantRoutes, layouts, views),
      ...transformElegantRoutesToVueRoutes([createNotFoundRoute()], layouts, views)
    ];
    const vueAuth = transformElegantRoutesToVueRoutes(groupAuthElegantRoutes(authRoutes), layouts, views);

    expect(vueAuth).toHaveLength(1);
    expect(vueAuth[0]?.name).toBe('root');
    expect(vueAuth[0]?.children?.map(child => child.name)).toEqual(['home', 'restricted']);
    expect(vueConstant.at(-1)?.path).toBe('/:pathMatch(.*)*');
    expect(vueConstant.map(route => route.path)).toEqual(
      expect.arrayContaining([
        '/login/:module(pwd-login|code-login|register|reset-pwd|bind-wechat)?',
        '/403',
        '/404',
        '/500',
        '/:pathMatch(.*)*'
      ])
    );
  });
});
