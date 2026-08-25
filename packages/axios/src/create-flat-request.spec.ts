import { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { createFlatRequest } from '@sa/axios';

function createClient() {
  return createFlatRequest({
    baseURL: 'https://request.invalid',
    successCode: '0000',
    logoutCodes: ['8888'],
    modalLogoutCodes: ['7777'],
    expiredTokenCodes: ['9999'],
    timeout: 50
  });
}

function successAdapter(data: unknown, status = 200) {
  return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config
  });
}

function rejectAdapter(error: AxiosError) {
  return async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    error.config = config;
    throw error;
  };
}

describe('expired token refresh', () => {
  it('refreshes once and replays the original request with the new token', async () => {
    let token = 'expired';
    const { request, setSessionHandlers } = createFlatRequest({
      baseURL: 'https://request.invalid',
      successCode: '0000',
      logoutCodes: ['8888'],
      modalLogoutCodes: ['7777'],
      expiredTokenCodes: ['9999'],
      timeout: 50,
      getToken: () => token
    });
    const refreshSession = vi.fn(async () => {
      token = 'fresh';
      return true;
    });
    const onTokenExpired = vi.fn();

    setSessionHandlers({ refreshSession, onTokenExpired });

    const result = await request<{ ok: boolean }>({
      url: '/test/protected',
      adapter: async config => {
        const authorization = String(config.headers.get('Authorization') || '');

        if (authorization === 'Bearer expired') {
          return {
            data: { code: '9999', message: 'Token expired', data: null },
            status: 200,
            statusText: 'OK',
            headers: {},
            config
          };
        }

        return {
          data: { code: '0000', data: { ok: true, authorization } },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        };
      }
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(onTokenExpired).not.toHaveBeenCalled();
    expect(result).toEqual({
      data: { ok: true, authorization: 'Bearer fresh' },
      error: null
    });
  });

  it('shares one refreshSession call across concurrent expired requests', async () => {
    let token = 'expired';
    const { request, setSessionHandlers } = createFlatRequest({
      baseURL: 'https://request.invalid',
      successCode: '0000',
      logoutCodes: ['8888'],
      modalLogoutCodes: ['7777'],
      expiredTokenCodes: ['9999'],
      timeout: 50,
      getToken: () => token
    });
    let releaseRefresh: () => void = () => undefined;
    const refreshGate = new Promise<void>(resolve => {
      releaseRefresh = resolve;
    });
    const refreshSession = vi.fn(async () => {
      await refreshGate;
      token = 'fresh';
      return true;
    });

    setSessionHandlers({ refreshSession });

    const adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
      const authorization = String(config.headers.get('Authorization') || '');

      if (authorization === 'Bearer expired') {
        return {
          data: { code: '9999', message: 'Token expired', data: null },
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        };
      }

      return {
        data: { code: '0000', data: { authorization } },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    };

    const first = request({ url: '/one', adapter });
    const second = request({ url: '/two', adapter });

    await vi.waitFor(() => expect(refreshSession).toHaveBeenCalledTimes(1));
    releaseRefresh();

    const results = await Promise.all([first, second]);

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(results.map(result => result.error)).toEqual([null, null]);
  });

  it('logs out when refreshSession fails and does not retry forever', async () => {
    const { request, setSessionHandlers } = createFlatRequest({
      baseURL: 'https://request.invalid',
      successCode: '0000',
      logoutCodes: ['8888'],
      modalLogoutCodes: ['7777'],
      expiredTokenCodes: ['9999'],
      timeout: 50,
      getToken: () => 'expired'
    });
    const refreshSession = vi.fn(async () => false);
    const onTokenExpired = vi.fn();

    setSessionHandlers({ refreshSession, onTokenExpired });

    const result = await request({
      url: '/test/protected',
      adapter: successAdapter({
        code: '9999',
        message: 'Token expired',
        data: null
      })
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(onTokenExpired).toHaveBeenCalledTimes(1);
    expect(result.error).toMatchObject({ kind: 'backend', code: '9999' });
  });

  it('does not refresh when skipExpiredRefresh is set', async () => {
    const refreshSession = vi.fn(async () => true);
    const { request, setSessionHandlers } = createClient();

    setSessionHandlers({ refreshSession });

    const result = await request({
      url: '/auth/refreshToken',
      skipExpiredRefresh: true,
      adapter: successAdapter({
        code: '9999',
        message: 'Token expired',
        data: null
      })
    });

    expect(refreshSession).not.toHaveBeenCalled();
    expect(result.error).toMatchObject({ code: '9999' });
  });
});

describe('createFlatRequest', () => {
  it('maps a success backend code to data and a null error', async () => {
    const { request } = createClient();
    const result = await request<{ token: string }>({
      url: '/auth/login',
      adapter: successAdapter({
        code: '0000',
        data: { token: 'access-token' }
      })
    });

    expect(result).toEqual({
      data: { token: 'access-token' },
      error: null
    });
  });

  it('maps a business failure code to a backend FlatResult', async () => {
    const { request } = createClient();
    const result = await request({
      url: '/auth/login',
      adapter: successAdapter({
        code: '1001',
        message: 'Invalid user name or password',
        data: null
      })
    });

    expect(result.data).toBeNull();
    expect(result.error).toMatchObject({
      kind: 'backend',
      code: '1001',
      message: 'Invalid user name or password'
    });
  });

  it('maps a transport failure without a response to a network error', async () => {
    const { request } = createClient();
    const networkError = new AxiosError('Network Error', 'ERR_NETWORK');
    const result = await request({
      url: '/auth/login',
      adapter: rejectAdapter(networkError)
    });

    expect(result.data).toBeNull();
    expect(result.error).toMatchObject({
      kind: 'network',
      code: 'ERR_NETWORK',
      message: 'Network Error'
    });
  });
});
