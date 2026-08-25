import { describe, expect, it } from 'vitest';
import type { MenuItem } from '@/store/route';
import { filterSearchEntries, flattenMenusToSearchEntries, matchSearchEntry, moveActiveIndex } from './search';

const menus: MenuItem[] = [
  {
    key: 'work',
    label: '工作台',
    path: '/work',
    children: [
      { key: 'home', label: '首页', i18nKey: 'route.home', path: '/home' },
      { key: 'restricted', label: '受限页', i18nKey: 'route.restricted', path: '/restricted' }
    ]
  }
];

function translate(key: string) {
  if (key === 'route.home') return '首页';
  if (key === 'route.restricted') return 'Restricted';
  return key;
}

describe('flattenMenusToSearchEntries', () => {
  it('keeps only leaf menus', () => {
    expect(flattenMenusToSearchEntries(menus).map(entry => entry.id)).toEqual(['home', 'restricted']);
  });
});

describe('filterSearchEntries', () => {
  const entries = flattenMenusToSearchEntries(menus);

  it('lists every leaf when the query is empty', () => {
    expect(filterSearchEntries(entries, '  ', translate).map(entry => entry.id)).toEqual(['home', 'restricted']);
  });

  it('matches translated labels, fallback labels and paths', () => {
    expect(filterSearchEntries(entries, '首', translate).map(entry => entry.id)).toEqual(['home']);
    expect(filterSearchEntries(entries, 'restricted', translate).map(entry => entry.id)).toEqual(['restricted']);
    expect(filterSearchEntries(entries, '/home', translate).map(entry => entry.id)).toEqual(['home']);
  });

  it('does not match a hidden sibling that is not in the menu tree', () => {
    expect(matchSearchEntry(entries[1]!, 'login', translate)).toBe(false);
  });
});

describe('moveActiveIndex', () => {
  it('wraps around the list', () => {
    expect(moveActiveIndex(3, 0, -1)).toBe(2);
    expect(moveActiveIndex(3, 2, 1)).toBe(0);
    expect(moveActiveIndex(0, 0, 1)).toBe(-1);
  });
});
