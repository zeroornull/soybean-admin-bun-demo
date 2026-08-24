import { request } from '../request';

export interface LoginToken {
  token: string;
  refreshToken: string;
}

export interface AuthUserInfo {
  userId: string;
  userName: string;
  roles: string[];
  buttons: string[];
  authorization: null | string;
}

export function fetchLogin(userName: string, password: string) {
  return request<LoginToken>({
    url: '/auth/login',
    method: 'post',
    data: {
      userName,
      password
    }
  });
}

export function fetchGetUserInfo() {
  return request<AuthUserInfo>({
    url: '/auth/getUserInfo'
  });
}

export function fetchRefreshToken(refreshToken: string) {
  return request<LoginToken>({
    url: '/auth/refreshToken',
    method: 'post',
    data: {
      refreshToken
    }
  });
}

export function fetchCustomBackendError(code: string, message = `Backend error ${code}`) {
  return request<null>({
    url: '/auth/error',
    params: {
      code,
      message
    }
  });
}
