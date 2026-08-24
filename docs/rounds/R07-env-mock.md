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

`.env.test` / `.env.prod` 只放环境差异：

```ini
VITE_SERVICE_BASE_URL=https://mock.apifox.cn/m1/3109515-0-default
```

Mock 地址可能失效。实际动手时以 legacy 当时能用的地址为准，若替换了服务，记到 `docs/decisions.md`。

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

### 5. 不经 Axios 验证连通性

临时用 `fetch('/proxy-default/auth/login', ...)` 或浏览器 Network 面板确认：

1. 请求先到 19528 的 Vite server；
2. path 中 proxy 前缀只出现一次；
3. Mock 收到的 path 为 `/auth/login`；
4. 正确与错误凭证都能得到结构化 JSON，而不是 CORS 错误页。

验证后删掉临时按钮或脚本，R08 由 request 层接管。

## 验收

- [ ] `bun run dev` 实际加载 `.env.test`，不误读 `.env.prod`
- [ ] `/proxy-default/auth/login` 能到达 Mock，Network 面板无 CORS 错误
- [ ] 关闭 proxy 时能说清直连 baseURL 与代理 baseURL 的差别
- [ ] 未声明的 `import.meta.env.VITE_XXX` 会在类型检查中报错
- [ ] `bun run typecheck` 通过

## 常见坑

- **proxy 前缀重复**：baseURL 与 API path 都拼了 `/proxy-default`。
- **Mock 失效当成代码错**：先直接访问 Mock 域名验证外部状态，再查 Vite proxy。
- **将 secret 放进 `VITE_*`**：它会被打包到浏览器代码中。
- **mode 与 `NODE_ENV` 混淆**：`--mode test` 决定 Vite env 文件，不等于把整个运行时变成 Node test 环境。

## 思考题

1. `bun run dev` 里的 `vite --mode test` 与 `NODE_ENV=test` 是一件事吗？
2. history 路由的 base 与 Vite build base 为什么必须对齐？

## 不要做

- 不要在本轮封装 Axios 拦截器
- 不要为了过 CORS 关闭浏览器安全策略
- 不要把 token 或私有源凭证写入 `.env*`
