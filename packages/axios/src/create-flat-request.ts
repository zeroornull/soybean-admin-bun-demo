import { create, isAxiosError, isCancel } from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import type {
  BackendResponse,
  CreateFlatRequestOptions,
  FlatRequest,
  RequestError,
  RequestSessionHandlers
} from './types';

function getBackendErrorDetails(data: unknown) {
  if (!data || typeof data !== 'object') return {};

  const response = data as Partial<BackendResponse<unknown>>;

  return {
    code: response.code,
    message: response.message || response.msg
  };
}

function normalizeAxiosError(error: unknown): RequestError {
  if (isCancel(error) || (isAxiosError(error) && error.code === 'ERR_CANCELED')) {
    return {
      kind: 'cancelled',
      message: 'Request cancelled',
      code: isAxiosError(error) ? error.code : undefined
    };
  }

  if (isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      const backend = getBackendErrorDetails(axiosError.response.data);

      return {
        kind: 'http',
        message: backend.message || axiosError.message,
        code: backend.code ?? axiosError.code,
        status: axiosError.response.status
      };
    }

    return {
      kind: 'network',
      message: axiosError.message,
      code: axiosError.code
    };
  }

  return {
    kind: 'network',
    message: error instanceof Error ? error.message : 'Unknown request error'
  };
}

export function createFlatRequest(options: CreateFlatRequestOptions) {
  const instance = create({
    baseURL: options.baseURL,
    timeout: options.timeout ?? 10_000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  let sessionHandlers: RequestSessionHandlers = {};

  instance.interceptors.request.use(config => {
    const token = options.getToken?.();

    if (token && !config.headers.has('Authorization')) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  });

  async function dispatchSessionFailure(code: string, error: RequestError) {
    let handler: RequestSessionHandlers[keyof RequestSessionHandlers];

    if (options.expiredTokenCodes.includes(code)) {
      handler = sessionHandlers.onTokenExpired;
    } else if (options.modalLogoutCodes.includes(code)) {
      handler = sessionHandlers.onModalLogout;
    } else if (options.logoutCodes.includes(code)) {
      handler = sessionHandlers.onLogout;
    }

    if (!handler) return;

    try {
      await handler(error);
    } catch {
      // Session side effects must not break the flat request result contract.
    }
  }

  const request: FlatRequest = async function request<T>(config: AxiosRequestConfig) {
    try {
      const response = await instance.request<BackendResponse<T>>(config);
      const backend = response.data;
      const code = String(backend.code);

      if (code === options.successCode) {
        return {
          data: backend.data,
          error: null
        };
      }

      const requestError: RequestError = {
        kind: 'backend',
        message: backend.message || backend.msg || 'Backend request failed',
        code
      };

      await dispatchSessionFailure(code, requestError);

      return {
        data: null,
        error: requestError
      };
    } catch (error) {
      return {
        data: null,
        error: normalizeAxiosError(error)
      };
    }
  };

  function setSessionHandlers(handlers: RequestSessionHandlers) {
    sessionHandlers = { ...handlers };
  }

  return {
    request,
    setSessionHandlers
  };
}
