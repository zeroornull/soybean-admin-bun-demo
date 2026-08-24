import { createServer } from 'node:http';

const host = process.env.MOCK_SERVICE_HOST || '127.0.0.1';
const port = Number(process.env.MOCK_SERVICE_PORT || 19007);

const corsHeaders = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Origin': '*'
};

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

  if (request.method === 'POST' && url.pathname === '/auth/login') {
    try {
      const body = await readJson(request);
      const authenticated = body.userName === 'Soybean' && body.password === '123456';

      if (authenticated) {
        sendJson(response, 200, {
          code: '0000',
          message: 'ok',
          data: {
            token: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
          }
        });
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

  sendJson(response, 404, {
    code: '4040',
    message: 'Mock route not found',
    data: null
  });
});

server.listen(port, host, () => {
  console.log(`[mock] listening on http://${host}:${port}`);
});

function closeServer() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
