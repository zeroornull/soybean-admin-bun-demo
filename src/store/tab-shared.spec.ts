import { describe, expect, it } from 'vitest';
import { filterTabsByRouteNames, parseStoredTabs, reorderTabs, resolveTabMode, type TabItem } from './tab-shared';

const home: TabItem = {
  id: 'home',
  label: 'Home',
  routeName: 'home',
  fullPath: '/home',
  pinned: true,
  keepAlive: true,
  componentName: 'Home'
};

const restricted: TabItem = {
  id: 'restricted',
  label: 'Restricted',
  routeName: 'restricted',
  fullPath: '/restricted',
  pinned: false,
  keepAlive: true,
  componentName: 'Restricted'
};

const docs: TabItem = {
  id: 'docs',
  label: 'Docs',
  routeName: 'docs',
  fullPath: '/docs',
  pinned: false,
  keepAlive: false
};

describe('resolveTabMode', () => {
  it('keeps chrome and falls back to button', () => {
    expect(resolveTabMode('chrome')).toBe('chrome');
    expect(resolveTabMode('slider')).toBe('button');
  });
});

describe('parseStoredTabs', () => {
  it('keeps well-formed tabs and drops garbage', () => {
    const parsed = parseStoredTabs(JSON.stringify([home, { id: 1 }, restricted, { routeName: 'x' }, null]));

    expect(parsed.map(tab => tab.id)).toEqual(['home', 'restricted']);
  });

  it('returns an empty list for invalid JSON', () => {
    expect(parseStoredTabs('{')).toEqual([]);
    expect(parseStoredTabs(null)).toEqual([]);
  });
});

describe('filterTabsByRouteNames', () => {
  it('drops tabs whose route is no longer registered', () => {
    expect(filterTabsByRouteNames([home, restricted, docs], ['home', 'restricted']).map(tab => tab.id)).toEqual([
      'home',
      'restricted'
    ]);
  });
});

describe('reorderTabs', () => {
  it('keeps pinned tabs packed on the left after a drop', () => {
    const moved = reorderTabs([home, restricted, docs], 2, 0);

    expect(moved.map(tab => tab.id)).toEqual(['home', 'docs', 'restricted']);
  });

  it('can swap two unpinned tabs', () => {
    const moved = reorderTabs([home, restricted, docs], 1, 2);

    expect(moved.map(tab => tab.id)).toEqual(['home', 'docs', 'restricted']);
  });
});
