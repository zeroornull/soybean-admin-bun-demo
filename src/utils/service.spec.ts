import { describe, expect, it } from 'vitest';
import { createServiceConfig, getProxyTargets, getServiceBaseURL, parseOtherServiceBaseURL } from './service';

describe('parseOtherServiceBaseURL', () => {
  it('keeps http(s) entries and drops invalid JSON or non-http values', () => {
    expect(parseOtherServiceBaseURL('{"demo":"http://127.0.0.1:19008"}')).toEqual({
      demo: 'http://127.0.0.1:19008'
    });
    expect(parseOtherServiceBaseURL('{"demo":"ftp://127.0.0.1:19008","ok":"https://example.com"}')).toEqual({
      ok: 'https://example.com'
    });
    expect(parseOtherServiceBaseURL('{')).toEqual({});
    expect(parseOtherServiceBaseURL('')).toEqual({});
  });
});

describe('getServiceBaseURL', () => {
  const env = {
    VITE_SERVICE_BASE_URL: 'http://127.0.0.1:19007',
    VITE_OTHER_SERVICE_BASE_URL: '{"demo":"http://127.0.0.1:19008"}'
  };

  it('uses proxy prefixes in development and absolute URLs without proxy', () => {
    expect(getServiceBaseURL(env, true)).toEqual({
      baseURL: '/proxy-default',
      otherBaseURL: { demo: '/proxy-demo' }
    });
    expect(getServiceBaseURL(env, false)).toEqual({
      baseURL: 'http://127.0.0.1:19007',
      otherBaseURL: { demo: 'http://127.0.0.1:19008' }
    });
  });
});

describe('getProxyTargets', () => {
  it('lists default and other-service proxy rewrites', () => {
    expect(
      getProxyTargets({
        VITE_SERVICE_BASE_URL: 'http://127.0.0.1:19007',
        VITE_OTHER_SERVICE_BASE_URL: '{"demo":"http://127.0.0.1:19008"}'
      })
    ).toEqual([
      { prefix: '/proxy-default', target: 'http://127.0.0.1:19007' },
      { prefix: '/proxy-demo', target: 'http://127.0.0.1:19008' }
    ]);
  });
});

describe('createServiceConfig', () => {
  it('ignores empty other-service config', () => {
    expect(createServiceConfig({ VITE_SERVICE_BASE_URL: 'http://127.0.0.1:19007' }).other).toEqual([]);
  });
});
