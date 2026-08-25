import { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
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
