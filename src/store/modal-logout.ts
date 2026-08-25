import { ref } from 'vue';

export function createModalLogoutController() {
  const visible = ref(false);
  const reason = ref('');
  let pending: Promise<boolean> | null = null;
  let resolvePending: ((value: boolean) => void) | null = null;
  let logoutOnce: Promise<void> | null = null;

  function request(message: string) {
    if (pending) return pending;

    reason.value = message;
    visible.value = true;
    pending = new Promise<boolean>(resolve => {
      resolvePending = resolve;
    });

    return pending;
  }

  function settle(confirmed: boolean) {
    if (!resolvePending) {
      visible.value = false;
      return;
    }

    const resolve = resolvePending;
    resolvePending = null;
    pending = null;
    visible.value = false;
    resolve(confirmed);
  }

  async function handle(message: string, logout: () => Promise<void> | void) {
    const confirmed = await request(message);

    if (!confirmed) return false;

    if (!logoutOnce) {
      logoutOnce = Promise.resolve(logout()).finally(() => {
        logoutOnce = null;
      });
    }

    await logoutOnce;
    return true;
  }

  return {
    visible,
    reason,
    request,
    confirm: () => settle(true),
    cancel: () => settle(false),
    handle
  };
}
