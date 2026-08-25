import type { MenuItem } from '@/store/route';

export type SearchKind = 'route' | 'command';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  label: string;
  i18nKey?: string;
  path?: string;
  icon?: string;
}

export function flattenMenusToSearchEntries(menus: MenuItem[]): SearchEntry[] {
  return menus.flatMap(menu => {
    if (menu.children?.length) return flattenMenusToSearchEntries(menu.children);

    return [
      {
        id: menu.key,
        kind: 'route',
        label: menu.label,
        i18nKey: menu.i18nKey,
        path: menu.path,
        icon: menu.icon
      }
    ];
  });
}

export function getSearchLabel(entry: SearchEntry, translate: (key: string) => string) {
  return entry.i18nKey ? translate(entry.i18nKey) : entry.label;
}

export function matchSearchEntry(entry: SearchEntry, keyword: string, translate: (key: string) => string) {
  const query = keyword.trim().toLowerCase();
  if (!query) return true;

  const haystacks = [getSearchLabel(entry, translate), entry.label, entry.path, entry.id];

  return haystacks.some(value => value?.toLowerCase().includes(query));
}

export function filterSearchEntries(entries: SearchEntry[], keyword: string, translate: (key: string) => string) {
  return entries.filter(entry => matchSearchEntry(entry, keyword, translate));
}

export function moveActiveIndex(length: number, current: number, delta: number) {
  if (length <= 0) return -1;

  const start = current < 0 || current >= length ? 0 : current;

  return (start + delta + length) % length;
}
