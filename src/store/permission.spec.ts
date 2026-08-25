import type { RouteRecordRaw } from 'vue-router';
import { describe, expect, it } from 'vitest';
import { filterAuthRoutesByRoles } from './route';

const page = { template: '<div />' };

const authTree: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    component: page,
    meta: { title: 'Root', hideInMenu: true },
    children: [
      {
        path: 'home',
        name: 'home',
        component: page,
        meta: { title: 'Home' }
      },
      {
        path: 'user-only',
        name: 'user-only',
        component: page,
        meta: { title: 'User', roles: ['R_USER'] }
      },
      {
        path: 'restricted',
        name: 'restricted',
        component: page,
        meta: { title: 'Restricted', roles: ['R_NOBODY'] }
      }
    ]
  }
];

function namesOf(routes: RouteRecordRaw[]): string[] {
  return routes.flatMap(route => [
    ...(route.name ? [String(route.name)] : []),
    ...(route.children ? namesOf(route.children) : [])
  ]);
}

describe('filterAuthRoutesByRoles', () => {
  it('keeps routes without roles and drops role-gated routes when the user has no roles', () => {
    const filtered = filterAuthRoutesByRoles(authTree, [], 'R_SUPER');

    expect(namesOf(filtered)).toEqual(['root', 'home']);
  });

  it('keeps overlapping role routes for a partial-role user', () => {
    const filtered = filterAuthRoutesByRoles(authTree, ['R_USER'], 'R_SUPER');

    expect(namesOf(filtered)).toEqual(['root', 'home', 'user-only']);
  });

  it('keeps the full tree for the static super role', () => {
    const filtered = filterAuthRoutesByRoles(authTree, ['R_SUPER'], 'R_SUPER');

    expect(namesOf(filtered)).toEqual(['root', 'home', 'user-only', 'restricted']);
  });
});
