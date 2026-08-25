import { describe, expect, it } from 'vitest';
import {
  buildRouteTrees,
  createPageFile,
  parsePageGlob,
  splitRouterName,
  transformRouterNameToPath
} from './from-glob';

describe('parsePageGlob', () => {
  it('turns nested folders into underscore names and slash paths', () => {
    expect(parsePageGlob('a/b/c/index.vue')).toMatchObject({
      routeName: 'a_b_c',
      routePath: '/a/b/c',
      routeParamKey: ''
    });
  });

  it('treats underscores in folder names as extra path segments', () => {
    expect(parsePageGlob('a/b_c/d/index.vue')).toMatchObject({
      routeName: 'a_b_c_d',
      routePath: '/a/b/c/d'
    });
  });

  it('drops folders that start with underscore, including _builtin', () => {
    expect(parsePageGlob('_builtin/403/index.vue')).toMatchObject({
      routeName: '403',
      routePath: '/403'
    });
    expect(parsePageGlob('_a/b_c/d/index.vue')).toMatchObject({
      routeName: 'b_c_d',
      routePath: '/b/c/d'
    });
  });

  it('turns [id].vue into a path param and keeps the parent name', () => {
    expect(parsePageGlob('a/b/[id].vue')).toMatchObject({
      routeName: 'a_b',
      routePath: '/a/b/:id',
      routeParamKey: 'id'
    });
  });

  it('rejects root-level files, components folders and unknown filenames', () => {
    expect(parsePageGlob('index.vue')).toBeNull();
    expect(parsePageGlob('home/components/index.vue')).toBeNull();
    expect(parsePageGlob('home/Hero.vue')).toBeNull();
  });
});

describe('splitRouterName', () => {
  it('expands a_b_c into ancestor names', () => {
    expect(splitRouterName('a_b_c')).toEqual(['a', 'a_b', 'a_b_c']);
    expect(transformRouterNameToPath('a_b_c')).toBe('/a/b/c');
  });
});

describe('buildRouteTrees', () => {
  it('creates a parent node when only a nested page file exists', () => {
    const detail = createPageFile('user_detail/index.vue')!;
    const trees = buildRouteTrees([detail]);

    expect(trees).toEqual([
      {
        routeName: 'user',
        routePath: '/user',
        children: [
          {
            routeName: 'user_detail',
            routePath: '/user/detail'
          }
        ]
      }
    ]);
  });
});
