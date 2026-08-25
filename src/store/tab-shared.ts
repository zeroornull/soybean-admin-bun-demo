export interface TabItem {
  id: string;
  label: string;
  labelKey?: string;
  routeName: string;
  fullPath: string;
  pinned: boolean;
  keepAlive: boolean;
  componentName?: string;
}

export const tabModes = ['button', 'chrome'] as const;
export type TabMode = (typeof tabModes)[number];
export const defaultTabMode: TabMode = 'button';

export function resolveTabMode(value: unknown): TabMode {
  return tabModes.includes(value as TabMode) ? (value as TabMode) : defaultTabMode;
}

export function parseStoredTabs(raw: unknown): TabItem[] {
  let source: unknown = raw;

  if (typeof raw === 'string') {
    try {
      source = JSON.parse(raw);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(source)) return [];

  return source.flatMap(item => {
    if (!item || typeof item !== 'object') return [];

    const tab = item as Record<string, unknown>;
    if (typeof tab.id !== 'string' || typeof tab.routeName !== 'string' || typeof tab.fullPath !== 'string') {
      return [];
    }

    return [
      {
        id: tab.id,
        label: typeof tab.label === 'string' && tab.label ? tab.label : tab.id,
        labelKey: typeof tab.labelKey === 'string' ? tab.labelKey : undefined,
        routeName: tab.routeName,
        fullPath: tab.fullPath,
        pinned: Boolean(tab.pinned),
        keepAlive: Boolean(tab.keepAlive),
        componentName: typeof tab.componentName === 'string' ? tab.componentName : undefined
      }
    ];
  });
}

export function filterTabsByRouteNames(tabs: TabItem[], routeNames: Iterable<string>) {
  const allowed = new Set(routeNames);

  return tabs.filter(tab => allowed.has(tab.routeName));
}

/** After a move, pinned tabs stay packed on the left. */
export function reorderTabs(tabs: TabItem[], fromIndex: number, toIndex: number) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= tabs.length || toIndex >= tabs.length) {
    return tabs;
  }

  const next = [...tabs];
  const [item] = next.splice(fromIndex, 1);
  if (!item) return tabs;

  next.splice(toIndex, 0, item);

  return [...next.filter(tab => tab.pinned), ...next.filter(tab => !tab.pinned)];
}
