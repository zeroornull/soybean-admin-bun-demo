export const loginModules = ['pwd-login', 'code-login', 'register', 'reset-pwd', 'bind-wechat'] as const;

export type LoginModule = (typeof loginModules)[number];

export const defaultLoginModule: LoginModule = 'pwd-login';

export const demoCaptchaCode = '123456';
export const demoSuperPhone = '13800138000';
export const demoUserPhone = '13900139000';

export function resolveLoginModule(value: unknown): LoginModule {
  return loginModules.includes(value as LoginModule) ? (value as LoginModule) : defaultLoginModule;
}

export function isValidPhone(value: string) {
  return /^1[3-9]\d{9}$/.test(value.trim());
}

export function isValidCaptcha(value: string) {
  return /^\d{6}$/.test(value.trim());
}

export function getSafeRedirectPath(redirect: unknown, fallback = '/home') {
  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    !redirect.startsWith('/login')
  ) {
    return redirect;
  }

  return fallback;
}
