export interface ServiceEnv {
  VITE_SERVICE_BASE_URL?: string;
  VITE_OTHER_SERVICE_BASE_URL?: string;
}

export interface OtherServiceConfigItem {
  key: string;
  baseURL: string;
  proxyPattern: string;
}

export interface ServiceConfig {
  baseURL: string;
  proxyPattern: string;
  other: OtherServiceConfigItem[];
}

const defaultProxyPattern = '/proxy-default';
const otherKeyPattern = /^[\w-]+$/;
const httpUrlPattern = /^https?:\/\//i;

export function createProxyPattern(key?: string) {
  return key ? `/proxy-${key}` : defaultProxyPattern;
}

export function parseOtherServiceBaseURL(raw: string | undefined): Record<string, string> {
  if (!raw?.trim()) return {};

  try {
    const parsed = JSON.parse(raw.trim()) as unknown;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        (entry): entry is [string, string] =>
          otherKeyPattern.test(entry[0]) && typeof entry[1] === 'string' && httpUrlPattern.test(entry[1])
      )
    );
  } catch {
    return {};
  }
}

export function createServiceConfig(env: ServiceEnv): ServiceConfig {
  const other = Object.entries(parseOtherServiceBaseURL(env.VITE_OTHER_SERVICE_BASE_URL)).map(([key, baseURL]) => ({
    key,
    baseURL,
    proxyPattern: createProxyPattern(key)
  }));

  return {
    baseURL: env.VITE_SERVICE_BASE_URL || '',
    proxyPattern: defaultProxyPattern,
    other
  };
}

export function getServiceBaseURL(env: ServiceEnv, isProxy: boolean) {
  const config = createServiceConfig(env);
  const otherBaseURL = Object.fromEntries(
    config.other.map(item => [item.key, isProxy ? item.proxyPattern : item.baseURL])
  );

  return {
    baseURL: isProxy ? config.proxyPattern : config.baseURL,
    otherBaseURL
  };
}

export function getProxyTargets(env: ServiceEnv) {
  const config = createServiceConfig(env);

  return [
    { prefix: config.proxyPattern, target: config.baseURL },
    ...config.other.map(item => ({ prefix: item.proxyPattern, target: item.baseURL }))
  ].filter(item => item.target);
}
