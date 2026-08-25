import { describe, expect, it } from 'vitest';
import type { MenuItem } from '@/store/route';
import {
  findActiveFirstLevelKey,
  getLayoutChrome,
  pickMenus,
  resolveLayoutMode,
  stripMenuChildren
} from './layout-mode';

const nestedMenus: MenuItem[] = [
  {
    key: 'work',
    label: '工作台',
    path: '/work',
    children: [
      { key: 'work_home', label: '概览', path: '/work/home' },
      { key: 'work_board', label: '看板', path: '/work/board' }
    ]
  },
  {
    key: 'restricted',
    label: '受限页',
    path: '/restricted'
  }
];

describe('resolveLayoutMode', () => {
  it('keeps known modes and falls back to vertical', () => {
    expect(resolveLayoutMode('horizontal')).toBe('horizontal');
    expect(resolveLayoutMode('vertical-mix')).toBe('vertical-mix');
    expect(resolveLayoutMode('nope')).toBe('vertical');
    expect(resolveLayoutMode(undefined)).toBe('vertical');
  });
});

describe('menu projection', () => {
  it('finds the first-level parent of a nested selected key', () => {
    expect(findActiveFirstLevelKey(nestedMenus, 'work_board')).toBe('work');
    expect(findActiveFirstLevelKey(nestedMenus, 'restricted')).toBe('restricted');
    expect(findActiveFirstLevelKey(nestedMenus, null)).toBe('work');
  });

  it('strips children for a first-level projection', () => {
    expect(stripMenuChildren(nestedMenus).map(item => [item.key, item.children])).toEqual([
      ['work', undefined],
      ['restricted', undefined]
    ]);
  });

  it('picks second-level children of the active first-level item', () => {
    expect(pickMenus(nestedMenus, 'second', 'work').map(item => item.key)).toEqual(['work_home', 'work_board']);
    expect(pickMenus(nestedMenus, 'second', 'restricted')).toEqual([]);
    expect(pickMenus(nestedMenus, 'first', 'work').map(item => item.key)).toEqual(['work', 'restricted']);
    expect(pickMenus(nestedMenus, 'all', 'work')).toBe(nestedMenus);
    expect(pickMenus(nestedMenus, 'none', 'work')).toEqual([]);
  });
});

describe('getLayoutChrome', () => {
  it('keeps the current vertical shell', () => {
    expect(getLayoutChrome('vertical', false)).toMatchObject({
      showSider: true,
      siderVariant: 'full',
      showSiderToggle: true,
      showHeaderMenu: false,
      siderMenus: 'all'
    });
  });

  it('puts first-level menus in the mix sider and second-level in a child column', () => {
    expect(getLayoutChrome('vertical-mix', true)).toMatchObject({
      showSider: true,
      siderVariant: 'mix',
      mixChildSider: true,
      siderMenus: 'first',
      headerMenus: 'none'
    });
    expect(getLayoutChrome('vertical-mix', false).mixChildSider).toBe(false);
  });

  it('hides the sider for horizontal and header-first modes without second-level menus', () => {
    expect(getLayoutChrome('horizontal', false)).toMatchObject({
      showSider: false,
      showHeaderLogo: true,
      showHeaderMenu: true,
      headerMenus: 'all'
    });
    expect(getLayoutChrome('vertical-hybrid-header-first', false).showSider).toBe(false);
    expect(getLayoutChrome('vertical-hybrid-header-first', true)).toMatchObject({
      showSider: true,
      siderMenus: 'second',
      headerMenus: 'first'
    });
  });

  it('puts first-level in the sider and second-level in the header for top-hybrid-sidebar-first', () => {
    expect(getLayoutChrome('top-hybrid-sidebar-first', true)).toMatchObject({
      showSider: true,
      siderVariant: 'mix',
      siderMenus: 'first',
      headerMenus: 'second',
      showHeaderMenu: true
    });
  });
});
