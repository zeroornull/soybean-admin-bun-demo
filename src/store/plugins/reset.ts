import type { PiniaPluginContext } from 'pinia';
import { setupStoreIds } from '../ids';

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function resetSetupStore({ store }: PiniaPluginContext) {
  if (!setupStoreIds.has(store.$id)) return;

  const defaultState = jsonClone(store.$state);

  store.$reset = () => {
    store.$patch(jsonClone(defaultState));
  };
}
