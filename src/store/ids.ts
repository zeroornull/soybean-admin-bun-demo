export const SetupStoreId = {
  App: 'app-store',
  Auth: 'auth-store',
  Theme: 'theme-store',
  Route: 'route-store',
  Tab: 'tab-store'
} as const;

export type SetupStoreId = (typeof SetupStoreId)[keyof typeof SetupStoreId];

export const setupStoreIds = new Set<string>(Object.values(SetupStoreId));
