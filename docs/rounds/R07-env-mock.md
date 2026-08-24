# R07 · 环境变量、代理与 Mock 连通

## 学习目标

- 理解 Vite 的 `mode` 与 `.env` / `.env.test` / `.env.prod` 加载顺序
- 给 `ImportMetaEnv` 补上严格类型，不在业务代码里到处解析字符串
- 独立验证「浏览器 → Vite proxy → Mock 服务」链路，不把网络配置问题混进 Axios 封装

## 为什么单独一轮

旧路线把环境变量、proxy、Axios、业务码和 token 刷新全放在 R07，一旦请求失败，很难判断是模式、域名、跨域还是拦截器出错。本轮只负责让连通性可见、可重复。

## 对照 legacy

- `legacy/.env`、`legacy/.env.test`、`legacy/.env.prod`
- `legacy/src/typings/vite-env.d.ts`
- `legacy/build/config/proxy.ts`
- `legacy/src/utils/service.ts`
- `legacy/vite.config.ts`

## 动手步骤

### 1. 分清公共配置与模式配置

`.env` 放所有模式共用的协议与应用配置：

```ini
VITE_APP_TITLE=SoybeanAdmin
VITE_BASE_URL=/
VITE_ROUTER_HISTORY_MODE=history
VITE_HTTP_PROXY=Y
VITE_SERVICE_SUCCESS_CODE=0000
VITE_SERVICE_LOGOUT_CODES=8888,8889
VITE_SERVICE_MODAL_LOGOUT_CODES=7777,7778
VITE_SERVICE_EXPIRED_TOKEN_CODES=9999,9998,3333
VITE_STORAGE_PREFIX=SOY_
```

`.env.test` / `.env.prod` 只放环境差异。当前学习仓库使用本地协议 Mock：

```ini
# .env.test
VITE_SERVICE_BASE_URL=http://127.0.0.1:19007

# .env.prod（R21 再定最终部署地址）
VITE_SERVICE_BASE_URL=http://127.0.0.1:19008
VITE_HTTP_PROXY=N
```

legacy 的 Apifox 地址目前强制 Token 鉴权，不能在仓库里写凭证。替换为本地 Mock 的原因、端口和协议见 `docs/decisions.md` D16。

### 2. 给环境变量建类型边界

`src/types/env.d.ts` 至少声明本路线已使用的字段：

```ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_ROUTER_HISTORY_MODE: 'hash' | 'history' | 'memory';
  readonly VITE_HTTP_PROXY: 'Y' | 'N';
  readonly VITE_SERVICE_BASE_URL: string;
  readonly VITE_SERVICE_SUCCESS_CODE: string;
  readonly VITE_SERVICE_LOGOUT_CODES: string;
  readonly VITE_SERVICE_MODAL_LOGOUT_CODES: string;
  readonly VITE_SERVICE_EXPIRED_TOKEN_CODES: string;
  readonly VITE_STORAGE_PREFIX: string;
}
```

只有 `VITE_` 前缀会暴露给客户端。令牌、私有源 token 与部署密钥不得写入这些字段。

### 3. 在 Vite 配置中读取 mode

`vite.config.ts` 改用函数形式的 `defineConfig`，通过 `loadEnv(mode, process.cwd(), '')` 读取服务地址。不要把整个 env 对象注入客户端。

### 4. 配置单一 proxy 前缀

开发环境统一通过 `/proxy-default` 访问 Mock，proxy 负责去掉前缀后转发到 `VITE_SERVICE_BASE_URL`。

先只做单服务；多服务 baseURL 是加分项，不要在这一轮将配置抽象成复杂的通用系统。

### 5. 启动本地协议 Mock

```bash
bun run dev
```

默认开发命令会先检查 `127.0.0.1:19007/health`：Mock 未运行时自动启动，已经运行时复用；Mock 就绪后再启动 Vite。按 `Ctrl+C` 时只关闭本次命令创建的子进程。需要独立定位问题时，仍可在两个终端分别运行 `bun run mock` 与 `bun run dev:app`。

Mock 默认监听 `127.0.0.1:19007`，提供 `GET /health` 与 `POST /auth/login`。正确凭证为 `Soybean / 123456`，只返回明确的模拟 token，不包含任何真实 secret。

### 6. 不经 Axios 验证连通性

临时用 `fetch('/proxy-default/auth/login', ...)` 或浏览器 Network 面板确认：

1. 请求先到 19528 的 Vite server；
2. path 中 proxy 前缀只出现一次；
3. Mock 收到的 path 为 `/auth/login`；
4. 正确与错误凭证都能得到结构化 JSON，而不是 CORS 错误页。

验证后删掉临时按钮或脚本，R08 由 request 层接管。

## 验收

- [x] `loadEnv('test')` 实际得到 `19007/Y`，`loadEnv('prod')` 得到 `19008/N`，共享成功码/路由/存储变量一致
- [x] Chrome 从 19528 请求 `/proxy-default/auth/login`，正确/错误凭证均 HTTP 200 + JSON，无 CORS 异常，Mock 实际日志只收到 `/auth/login`
- [x] 直连 `19007/health` 为跨源请求，依赖 Mock CORS；代理请求从浏览器看是同源 `19528/proxy-default/*`，由 Vite 转发并 rewrite
- [x] 临时访问 `import.meta.env.VITE_NOT_DECLARED` 时 vue-tsc 报 TS2339，删除临时文件后正常 typecheck 恢复通过
- [x] `bun run typecheck` 与 `bun run build` 通过，prod bundle 未注入未使用的 service URL

R07 实际证据（2026-08-24）：

- 直连 legacy Apifox 域名的正确/错误登录都返回 HTTP 500，正文为 `apifoxError.code=401` 且明确要求 Token；域名/TLS/DNS 可达，是服务鉴权政策变更，不是代理或 CORS 故障；
- 新增 `scripts/mock-service.ts`，使用 Node `http` 协议 API，无新 runtime 依赖；`bun run mock` 启动 test Mock，prod 预留端口 19008；
- 正确登录返回 `code=0000` + mock access/refresh token，错误登录返回 `code=1001` + `data=null`，非法 JSON 为 HTTP 400，未知路径为 404 协议 JSON；
- `resolveConfig` 实测 test proxy 只有 `/proxy-default`，target 为 19007，rewrite 将 `/proxy-default/auth/login` 变为 `/auth/login`；prod `server.proxy` 为 `undefined`；
- curl direct/proxy health/correct/wrong 全部返回结构化 JSON，响应保留 `Content-Type: application/json` 与 `Access-Control-Allow-Origin: *`；
- Chrome Fetch 实测 proxy correct/wrong 和跨源 direct health 全部成功，Performance Resource URL 明确为同源 `/proxy-default/auth/login`；
- `ViteTypeOptions.strictImportMetaEnv` 已启用，未声明 env 产生 `Property 'VITE_NOT_DECLARED' does not exist on type 'ImportMetaEnv'`；
- 生产构建转换 55 个模块，`bun install --frozen-lockfile`、typecheck、build 通过，未引入 Axios、未将 secret 写入 env。
- 登录实测发现只启动 Vite 时 proxy 会因 `19007` 无监听而报 `ECONNREFUSED`；后续新增 `scripts/dev.ts`，让 `bun run dev` 自动启动或复用 Mock，再启动 Vite，决定见 D17。

## 常见坑

- **proxy 前缀重复**：baseURL 与 API path 都拼了 `/proxy-default`。
- **单独启动 Vite 导致 `ECONNREFUSED 127.0.0.1:19007`**：默认使用 `bun run dev`；只有分步排障时才单独运行 `bun run dev:app`，并先确认 `bun run mock` 已启动。
- **Mock 失效当成代码错**：先直接访问 Mock 的 `/health` 验证服务状态，再查 Vite proxy。
- **将 secret 放进 `VITE_*`**：它会被打包到浏览器代码中。
- **mode 与 `NODE_ENV` 混淆**：`--mode test` 决定 Vite env 文件，不等于把整个运行时变成 Node test 环境。

## 思考题

1. `bun run dev` 里的 `vite --mode test` 与 `NODE_ENV=test` 是一件事吗？
2. history 路由的 base 与 Vite build base 为什么必须对齐？

## 不要做

- 不要在本轮封装 Axios 拦截器
- 不要为了过 CORS 关闭浏览器安全策略
- 不要把 token 或私有源凭证写入 `.env*`
