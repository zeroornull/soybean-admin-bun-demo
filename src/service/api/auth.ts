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

export function fetchSendCaptcha(phone: string) {
  return request<{ expireSeconds: number }>({
    url: '/auth/captcha',
    method: 'post',
    data: { phone }
  });
}

export function fetchCodeLogin(phone: string, code: string) {
  return request<LoginToken>({
    url: '/auth/codeLogin',
    method: 'post',
    data: { phone, code }
  });
}

export function fetchRegister(phone: string, code: string, password: string) {
  return request<{ phone: string }>({
    url: '/auth/register',
    method: 'post',
    data: { phone, code, password }
  });
}

export function fetchResetPassword(phone: string, code: string, password: string) {
  return request<{ phone: string }>({
    url: '/auth/resetPwd',
    method: 'post',
    data: { phone, code, password }
  });
}

export function fetchWechatLogin() {
  return request<LoginToken>({
    url: '/auth/wechatLogin',
    method: 'post',
    data: { mock: true }
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
    skipExpiredRefresh: true,
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
