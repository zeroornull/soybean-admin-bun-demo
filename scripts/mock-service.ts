import { createServer } from 'node:http';

const host = process.env.MOCK_SERVICE_HOST || '127.0.0.1';
const port = Number(process.env.MOCK_SERVICE_PORT || 19007);

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Origin': '*'
};

const knownAuthPaths = new Set(['/', '/home', '/restricted', '/iframe-page']);
const otherPort = Number(process.env.MOCK_OTHER_SERVICE_PORT || 19008);

function identityFromAuthorization(authorization: string | null) {
  if (authorization === 'Bearer mock-expired-access-token') return 'expired';
  if (['Bearer mock-access-token', 'Bearer mock-refreshed-access-token'].includes(authorization || '')) return 'super';
  if (['Bearer mock-user-access-token', 'Bearer mock-user-refreshed-access-token'].includes(authorization || '')) {
    return 'user';
  }

  return 'anon';
}

function homeRoute() {
  return {
    name: 'home',
    path: 'home',
    component: 'home',
    meta: {
      title: '首页',
      i18nKey: 'route.home',
      icon: '⌂',
      order: 1,
      componentName: 'Home',
      keepAlive: true,
      pinned: true,
      requiresAuth: true
    }
  };
}

function restrictedRoute() {
  return {
    name: 'restricted',
    path: 'restricted',
    component: 'restricted',
    meta: {
      title: '受限页',
      i18nKey: 'route.restricted',
      icon: '⚿',
      order: 20,
      componentName: 'Restricted',
      keepAlive: true,
      requiresAuth: true
    }
  };
}

function iframePageRoute() {
  return {
    name: 'iframe-page',
    path: 'iframe-page/:url?',
    component: 'iframe-page',
    meta: {
      title: '外链页面',
      i18nKey: 'route.iframe-page',
      icon: '⧉',
      order: 15,
      componentName: 'IframePage',
      keepAlive: true,
      requiresAuth: true
    }
  };
}

function userRoutes(isSuper: boolean) {
  return {
    home: 'home',
    routes: [
      {
        name: 'root',
        path: '/',
        component: 'layout.base',
        redirect: '/home',
        meta: {
          title: '',
          hideInMenu: true,
          requiresAuth: true
        },
        children: isSuper ? [homeRoute(), iframePageRoute(), restrictedRoute()] : [homeRoute(), iframePageRoute()]
      }
    ]
  };
}

function sendJson(response: import('node:http').ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    ...corsHeaders,
    'Content-Type': 'application/json; charset=utf-8'
  });
  response.end(JSON.stringify(body));
}

async function readJson(request: import('node:http').IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks).toString('utf8');

  return body ? (JSON.parse(body) as Record<string, unknown>) : {};
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || `${host}:${port}`}`);

  console.log(`[mock] ${request.method} ${url.pathname}`);

  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, {
      code: '0000',
      message: 'ok',
      data: { service: 'soybean-local-mock' }
    });
    return;
  }

  function sendAuthTokens(isSuperUser: boolean) {
    sendJson(response, 200, {
      code: '0000',
      message: 'ok',
      data: {
        token: isSuperUser ? 'mock-access-token' : 'mock-user-access-token',
        refreshToken: isSuperUser ? 'mock-refresh-token' : 'mock-user-refresh-token'
      }
    });
  }

  if (request.method === 'POST' && url.pathname === '/auth/login') {
    try {
      const body = await readJson(request);
      const passwordValid = body.password === '123456';
      const isSuperUser = body.userName === 'Soybean';
      const isRegularUser = body.userName === 'User';

      if (passwordValid && (isSuperUser || isRegularUser)) {
        sendAuthTokens(isSuperUser);
        return;
      }

      sendJson(response, 200, {
        code: '1001',
        message: 'Invalid user name or password',
        data: null
      });
      return;
    } catch {
      sendJson(response, 400, {
        code: '4000',
        message: 'Invalid JSON body',
        data: null
      });
      return;
    }
  }

  if (request.method === 'POST' && url.pathname === '/auth/captcha') {
    try {
      const body = await readJson(request);
      const phone = String(body.phone || '');

      if (!/^1[3-9]\d{9}$/.test(phone)) {
        sendJson(response, 200, {
          code: '1002',
          message: 'Invalid phone number',
          data: null
        });
        return;
      }

      sendJson(response, 200, {
        code: '0000',
        message: 'ok',
        data: { expireSeconds: 60, demoCode: '123456' }
      });
      return;
    } catch {
      sendJson(response, 400, {
        code: '4000',
        message: 'Invalid JSON body',
        data: null
      });
      return;
    }
  }

  if (request.method === 'POST' && url.pathname === '/auth/codeLogin') {
    try {
      const body = await readJson(request);
      const phone = String(body.phone || '');
      const code = String(body.code || '');
      const isSuperUser = phone === '13800138000';
      const isRegularUser = phone === '13900139000';

      if (code === '123456' && (isSuperUser || isRegularUser)) {
        sendAuthTokens(isSuperUser);
        return;
      }

      sendJson(response, 200, {
        code: '1003',
        message: 'Invalid phone or captcha',
        data: null
      });
      return;
    } catch {
      sendJson(response, 400, {
        code: '4000',
        message: 'Invalid JSON body',
        data: null
      });
      return;
    }
  }

  if (request.method === 'POST' && (url.pathname === '/auth/register' || url.pathname === '/auth/resetPwd')) {
    try {
      const body = await readJson(request);
      const phone = String(body.phone || '');
      const code = String(body.code || '');
      const password = String(body.password || '');

      if (!/^1[3-9]\d{9}$/.test(phone) || code !== '123456' || password.length < 6) {
        sendJson(response, 200, {
          code: '1004',
          message: 'Invalid phone, captcha or password',
          data: null
        });
        return;
      }

      sendJson(response, 200, {
        code: '0000',
        message: 'ok',
        data: { phone }
      });
      return;
    } catch {
      sendJson(response, 400, {
        code: '4000',
        message: 'Invalid JSON body',
        data: null
      });
      return;
    }
  }

  if (request.method === 'POST' && url.pathname === '/auth/wechatLogin') {
    sendAuthTokens(true);
    return;
  }

  if (request.method === 'GET' && url.pathname === '/auth/getUserInfo') {
    const authorization = request.headers.authorization || null;

    if (authorization === 'Bearer mock-expired-access-token') {
      sendJson(response, 200, {
        code: '9999',
        message: 'Token expired',
        data: null
      });
      return;
    }

    const isSuperUser = ['Bearer mock-access-token', 'Bearer mock-refreshed-access-token'].includes(
      authorization || ''
    );
    const isRegularUser = ['Bearer mock-user-access-token', 'Bearer mock-user-refreshed-access-token'].includes(
      authorization || ''
    );

    if (!isSuperUser && !isRegularUser) {
      sendJson(response, 200, {
        code: '8888',
        message: 'Session expired',
        data: null
      });
      return;
    }

    sendJson(response, 200, {
      code: '0000',
      message: 'ok',
      data: {
        userId: isSuperUser ? '1' : '2',
        userName: isSuperUser ? 'Soybean' : 'User',
        roles: isSuperUser ? ['R_SUPER'] : ['R_USER'],
        buttons: isSuperUser ? ['B_CODE1', 'B_CODE2'] : ['B_CODE1'],
        authorization
      }
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/test/protected') {
    const authorization = request.headers.authorization || '';

    if (authorization === 'Bearer mock-expired-access-token') {
      sendJson(response, 200, {
        code: '9999',
        message: 'Token expired',
        data: null
      });
      return;
    }

    const isKnownToken = [
      'Bearer mock-access-token',
      'Bearer mock-refreshed-access-token',
      'Bearer mock-user-access-token',
      'Bearer mock-user-refreshed-access-token'
    ].includes(authorization);

    if (!isKnownToken) {
      sendJson(response, 200, {
        code: '8888',
        message: 'Session expired',
        data: null
      });
      return;
    }

    sendJson(response, 200, {
      code: '0000',
      message: 'ok',
      data: { service: 'soybean-local-mock' }
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/test/echo-auth') {
    sendJson(response, 200, {
      code: '0000',
      message: 'ok',
      data: {
        authorization: request.headers.authorization || null
      }
    });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/auth/refreshToken') {
    try {
      const body = await readJson(request);

      if (body.refreshToken === 'mock-refresh-token') {
        sendJson(response, 200, {
          code: '0000',
          message: 'ok',
          data: {
            token: 'mock-refreshed-access-token',
            refreshToken: 'mock-refreshed-token'
          }
        });
        return;
      }

      if (body.refreshToken === 'mock-user-refresh-token') {
        sendJson(response, 200, {
          code: '0000',
          message: 'ok',
          data: {
            token: 'mock-user-refreshed-access-token',
            refreshToken: 'mock-user-refreshed-token'
          }
        });
        return;
      }

      sendJson(response, 200, {
        code: '1002',
        message: 'Invalid refresh token',
        data: null
      });
      return;
    } catch {
      sendJson(response, 400, {
        code: '4000',
        message: 'Invalid JSON body',
        data: null
      });
      return;
    }
  }

  if (request.method === 'GET' && url.pathname === '/auth/error') {
    const code = url.searchParams.get('code') || '1000';

    sendJson(response, 200, {
      code,
      message: url.searchParams.get('message') || `Backend error ${code}`,
      data: null
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/route/getUserRoutes') {
    const identity = identityFromAuthorization(request.headers.authorization || null);

    if (identity === 'expired') {
      sendJson(response, 200, {
        code: '9999',
        message: 'Token expired',
        data: null
      });
      return;
    }

    if (identity === 'anon') {
      sendJson(response, 200, {
        code: '8888',
        message: 'Session expired',
        data: null
      });
      return;
    }

    sendJson(response, 200, {
      code: '0000',
      message: 'ok',
      data: userRoutes(identity === 'super')
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/route/isRouteExist') {
    const path = url.searchParams.get('path') || '';
    const normalized = path === '/' ? path : path.replace(/\/+$/, '');
    const exists = knownAuthPaths.has(normalized) || normalized.startsWith('/iframe-page/');

    sendJson(response, 200, {
      code: '0000',
      message: 'ok',
      data: exists
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/test/http-500') {
    sendJson(response, 500, {
      code: '5000',
      message: 'Mock HTTP 500',
      data: null
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/test/delay') {
    const requestedDelay = Number(url.searchParams.get('ms') || 250);
    const delay = Number.isFinite(requestedDelay) ? Math.min(Math.max(requestedDelay, 0), 5_000) : 250;

    await new Promise(resolve => setTimeout(resolve, delay));
    sendJson(response, 200, {
      code: '0000',
      message: 'ok',
      data: { delay }
    });
    return;
  }

  sendJson(response, 404, {
    code: '4040',
    message: 'Mock route not found',
    data: null
  });
});

const otherServer = createServer((request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || `${host}:${otherPort}`}`);

  console.log(`[mock-other] ${request.method} ${url.pathname}`);

  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  if (request.method === 'GET' && (url.pathname === '/health' || url.pathname === '/ping')) {
    sendJson(response, 200, {
      code: '0000',
      message: 'ok',
      data: { service: 'soybean-other-mock' }
    });
    return;
  }

  sendJson(response, 404, {
    code: '4040',
    message: 'Mock route not found',
    data: null
  });
});

server.listen(port, host, () => {
  console.log(`[mock] listening on http://${host}:${port}`);
});

otherServer.listen(otherPort, host, () => {
  console.log(`[mock] other service listening on http://${host}:${otherPort}`);
});

function closeServer() {
  let remaining = 2;

  function done() {
    remaining -= 1;
    if (remaining <= 0) process.exit(0);
  }

  server.close(done);
  otherServer.close(done);
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
