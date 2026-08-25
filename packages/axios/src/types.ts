import type { AxiosRequestConfig } from 'axios';

export type RequestErrorKind = 'network' | 'http' | 'backend' | 'cancelled';

export type AppRequestConfig = AxiosRequestConfig & {
  skipExpiredRefresh?: boolean;
  expiredRefreshRetried?: boolean;
};

export interface RequestError {
  kind: RequestErrorKind;
  message: string;
  code?: string | number;
  status?: number;
}

export type FlatResult<T> = { data: T; error: null } | { data: null; error: RequestError };

export interface BackendResponse<T> {
  code: string | number;
  message?: string;
  msg?: string;
  data: T;
}

export type RequestSessionHandler = (error: RequestError) => Promise<void> | void;

export interface RequestSessionHandlers {
  onLogout?: RequestSessionHandler;
  onModalLogout?: RequestSessionHandler;
  onTokenExpired?: RequestSessionHandler;
  refreshSession?: () => Promise<boolean>;
}

export interface CreateFlatRequestOptions {
  baseURL: string;
  successCode: string;
  logoutCodes: readonly string[];
  modalLogoutCodes: readonly string[];
  expiredTokenCodes: readonly string[];
  getToken?: () => null | string;
  timeout?: number;
}

export type FlatRequest = <T>(config: AppRequestConfig) => Promise<FlatResult<T>>;
