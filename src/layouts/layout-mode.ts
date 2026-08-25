import type { MenuItem } from '@/store/route';

export const layoutModes = [
  'vertical',
  'vertical-mix',
  'vertical-hybrid-header-first',
  'horizontal',
  'top-hybrid-sidebar-first',
  'top-hybrid-header-first'
] as const;

export type LayoutMode = (typeof layoutModes)[number];
export const defaultLayoutMode: LayoutMode = 'vertical';

export type MenuPlacement = 'all' | 'first' | 'second' | 'none';

export interface LayoutChrome {
  showSider: boolean;
  siderVariant: 'full' | 'mix';
  showSiderToggle: boolean;
  showHeaderLogo: boolean;
  showHeaderMenu: boolean;
  mixChildSider: boolean;
  siderMenus: MenuPlacement;
  headerMenus: MenuPlacement;
}

export function resolveLayoutMode(value: unknown): LayoutMode {
  return layoutModes.includes(value as LayoutMode) ? (value as LayoutMode) : defaultLayoutMode;
}

export function menuHasChildren(item: Pick<MenuItem, 'children'> | undefined) {
  return Boolean(item?.children?.length);
}

export function findMenuByKey(menus: MenuItem[], key: string | null | undefined): MenuItem | undefined {
  if (!key) return undefined;

  for (const menu of menus) {
    if (menu.key === key) return menu;
    const nested = menu.children ? findMenuByKey(menu.children, key) : undefined;
    if (nested) return nested;
  }

  return undefined;
}

export function findActiveFirstLevelKey(menus: MenuItem[], selectedKey: string | null | undefined) {
  if (!menus.length) return null;
  if (!selectedKey) return menus[0]?.key ?? null;

  for (const menu of menus) {
    if (menu.key === selectedKey) return menu.key;
    if (menu.children && findMenuByKey(menu.children, selectedKey)) return menu.key;
  }

  return menus[0]?.key ?? null;
}

export function stripMenuChildren(menus: MenuItem[]): MenuItem[] {
  return menus.map(menu => ({
    key: menu.key,
    label: menu.label,
    i18nKey: menu.i18nKey,
    icon: menu.icon,
    path: menu.path
  }));
}

export function pickMenus(menus: MenuItem[], placement: MenuPlacement, activeFirstLevelKey: string | null) {
  if (placement === 'none') return [];
  if (placement === 'all') return menus;
  if (placement === 'first') return stripMenuChildren(menus);

  return menus.find(menu => menu.key === activeFirstLevelKey)?.children ?? [];
}

export function getLayoutChrome(mode: LayoutMode, hasSecondLevel: boolean): LayoutChrome {
  switch (mode) {
    case 'vertical-mix':
      return {
        showSider: true,
        siderVariant: 'mix',
        showSiderToggle: false,
        showHeaderLogo: false,
        showHeaderMenu: false,
        mixChildSider: hasSecondLevel,
        siderMenus: 'first',
        headerMenus: 'none'
      };
    case 'vertical-hybrid-header-first':
      return {
        showSider: hasSecondLevel,
        siderVariant: 'full',
        showSiderToggle: false,
        showHeaderLogo: !hasSecondLevel,
        showHeaderMenu: true,
        mixChildSider: false,
        siderMenus: 'second',
        headerMenus: 'first'
      };
    case 'horizontal':
      return {
        showSider: false,
        siderVariant: 'full',
        showSiderToggle: false,
        showHeaderLogo: true,
        showHeaderMenu: true,
        mixChildSider: false,
        siderMenus: 'none',
        headerMenus: 'all'
      };
    case 'top-hybrid-sidebar-first':
      return {
        showSider: true,
        siderVariant: 'mix',
        showSiderToggle: false,
        showHeaderLogo: true,
        showHeaderMenu: hasSecondLevel,
        mixChildSider: false,
        siderMenus: 'first',
        headerMenus: 'second'
      };
    case 'top-hybrid-header-first':
      return {
        showSider: hasSecondLevel,
        siderVariant: 'full',
        showSiderToggle: hasSecondLevel,
        showHeaderLogo: true,
        showHeaderMenu: true,
        mixChildSider: false,
        siderMenus: 'second',
        headerMenus: 'first'
      };
    default:
      return {
        showSider: true,
        siderVariant: 'full',
        showSiderToggle: true,
        showHeaderLogo: false,
        showHeaderMenu: false,
        mixChildSider: false,
        siderMenus: 'all',
        headerMenus: 'none'
      };
  }
}
