import { createFlatRequest } from './create-flat-request';
import { getAccessToken } from '@/utils/storage';
import type { RequestSessionHandlers } from './types';

function parseCodes(value: string) {
  return value
    .split(',')
    .map(code => code.trim())
    .filter(Boolean);
}

const proxyEnabled = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const baseURL = proxyEnabled ? '/proxy-default' : import.meta.env.VITE_SERVICE_BASE_URL;

const flatRequest = createFlatRequest({
  baseURL,
  successCode: import.meta.env.VITE_SERVICE_SUCCESS_CODE,
  logoutCodes: parseCodes(import.meta.env.VITE_SERVICE_LOGOUT_CODES),
  modalLogoutCodes: parseCodes(import.meta.env.VITE_SERVICE_MODAL_LOGOUT_CODES),
  expiredTokenCodes: parseCodes(import.meta.env.VITE_SERVICE_EXPIRED_TOKEN_CODES),
  getToken: getAccessToken
});

export const request = flatRequest.request;

export function setRequestSessionHandlers(handlers: RequestSessionHandlers) {
  flatRequest.setSessionHandlers(handlers);
}

export { createFlatRequest } from './create-flat-request';
export type * from './types';
