import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchGetUserInfo, fetchLogin, fetchRefreshToken } from '@/service/api';
import {
  clearAccessToken,
  clearRefreshToken,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken
} from '@/utils/storage';
import { SetupStoreId } from './ids';
import { useRouteStore } from './route';
import { useTabStore } from './tab';

export interface UserInfo {
  userId: string;
  userName: string;
  roles: string[];
  buttons: string[];
}

export interface ResetAuthOptions {
  reason?: string;
  redirect?: boolean;
}

type AuthNavigator = () => Promise<void> | void;

let authNavigator: AuthNavigator | undefined;

export function setAuthNavigator(navigator: AuthNavigator) {
  authNavigator = navigator;
}

/** Authentication session state and lifecycle. */
export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const token = ref('');
  const refreshToken = ref('');
  const userInfo = ref<UserInfo | null>(null);
  const loading = ref(false);
  const initializing = ref(false);
  const sessionInitialized = ref(false);
  const authError = ref<string | null>(null);
  const isLogin = computed(() => Boolean(token.value && userInfo.value));

  let initSessionPromise: Promise<boolean> | null = null;

  function applyTokens(nextToken: string, nextRefreshToken: string) {
    token.value = nextToken;
    refreshToken.value = nextRefreshToken;
    setAccessToken(nextToken);
    setRefreshToken(nextRefreshToken);
  }

  async function getUserInfo() {
    const { data, error } = await fetchGetUserInfo();

    if (error) {
      authError.value = error.message;
      return false;
    }

    userInfo.value = data;
    authError.value = null;
    return true;
  }

  async function resetStore(options: ResetAuthOptions = {}) {
    const reason = options.reason || null;

    clearAccessToken();
    clearRefreshToken();
    token.value = '';
    refreshToken.value = '';
    userInfo.value = null;
    loading.value = false;
    authError.value = reason;

    useTabStore().clearTabs();
    useRouteStore().resetStore();

    sessionInitialized.value = true;

    if (options.redirect === false) return;

    await authNavigator?.();
  }

  async function login(userName: string, password: string) {
    if (loading.value) return false;

    loading.value = true;
    authError.value = null;

    try {
      const { data, error } = await fetchLogin(userName, password);

      if (error) {
        authError.value = error.message;
        return false;
      }

      applyTokens(data.token, data.refreshToken);

      const initialized = await getUserInfo();

      if (!initialized) {
        if (token.value) {
          await resetStore({ reason: authError.value || 'Unable to load user information', redirect: false });
        }
        return false;
      }

      sessionInitialized.value = true;

      return true;
    } finally {
      loading.value = false;
    }
  }

  function initSession() {
    if (sessionInitialized.value) return Promise.resolve(isLogin.value);
    if (initSessionPromise) return initSessionPromise;

    initSessionPromise = (async () => {
      initializing.value = true;
      authError.value = null;

      try {
        const storedToken = getAccessToken();

        if (!storedToken) return false;

        token.value = storedToken;
        refreshToken.value = getRefreshToken() || '';

        const initialized = await getUserInfo();

        if (!initialized && token.value) {
          await resetStore({ reason: authError.value || 'Unable to restore session', redirect: false });
        }

        return initialized;
      } finally {
        initializing.value = false;
        sessionInitialized.value = true;
        initSessionPromise = null;
      }
    })();

    return initSessionPromise;
  }

  async function refreshSession() {
    const currentRefreshToken = getRefreshToken() || refreshToken.value;

    if (!currentRefreshToken) {
      await resetStore({ reason: 'Session expired' });
      return false;
    }

    const { data, error } = await fetchRefreshToken(currentRefreshToken);

    if (error || !data) {
      await resetStore({ reason: error?.message || 'Unable to refresh session' });
      return false;
    }

    applyTokens(data.token, data.refreshToken);
    return true;
  }

  return {
    token,
    refreshToken,
    userInfo,
    loading,
    initializing,
    sessionInitialized,
    authError,
    isLogin,
    login,
    getUserInfo,
    initSession,
    refreshSession,
    resetStore
  };
});
