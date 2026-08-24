# R08 · HTTP 请求核心

## 学习目标

- 封装 Axios 的 baseURL、超时、请求头和后端业务码协议
- 实现 **flat 返回值** `{ data, error }`，让业务调用方不重复写 `try/catch`
- 把 HTTP 失败、后端业务失败、主动取消归一为稳定的错误对象
- 为 R09 的登录与会话恢复提供可测的 API 边界

## 对照 legacy

- `legacy/packages/axios/src/index.ts`
- `legacy/packages/axios/src/options.ts`
- `legacy/packages/axios/src/type.ts`
- `legacy/src/service/request/index.ts`
- `legacy/src/service/request/shared.ts`
- `legacy/src/service/api/auth.ts`
- `legacy/src/utils/storage.ts`

本轮先写在 `src/service/`，R19 先锁定请求契约，R20 再决定哪一层适合抽进 `@sa/axios`。

## 动手步骤

### 1. 安装 Axios

```bash
bun add axios
```

先不加 `axios-retry`。自动重试必须知道请求是否幂等，不能对所有 POST 一视同仁。

### 2. 先定义返回协议

```ts
export type FlatResult<T> = { data: T; error: null } | { data: null; error: RequestError };

export interface RequestError {
  kind: 'network' | 'http' | 'backend' | 'cancelled';
  message: string;
  code?: string | number;
  status?: number;
}
```

约束：成功时 `error === null`，失败时 `data === null`。不允许两者同时有值，也不允许两者同时为 null。

### 3. 建立 Axios instance

baseURL 直接消费 R07 已验证的结果：开启 proxy 时用 `/proxy-default`，关闭时用 `VITE_SERVICE_BASE_URL`。

请求拦截器只做与协议相关的事：

- 从 storage 读 token；
- 写入 `Authorization`；
- 保留调用方显式传入的 header。

不要在模块顶层取 Pinia store，也不要在拦截器里直接 `router.push`。

### 4. 解析后端业务码

```ts
const isBackendSuccess = String(response.data.code) === import.meta.env.VITE_SERVICE_SUCCESS_CODE;
```

成功时取 `response.data.data`；失败时将 code 和 message 转成 `RequestError`。业务失败不应该以 unhandled rejection 的形式泄漏到页面。

### 5. 预留会话失效回调

request 工厂可接受应用层回调：

- `onLogout`：直接登出码；
- `onModalLogout`：需提示后登出的码；
- `onTokenExpired`：token 过期码。

R09 再将回调接到 auth store。主线允许过期码先安全登出；「刷新 token 单飞 + 原请求重放」仍是加分项，不与基础封装捆绑。

### 6. 建立 auth API 模块

至少提供：

- `fetchLogin(userName, password)`
- `fetchGetUserInfo()`
- `fetchRefreshToken(refreshToken)`（若主线暂不刷新，允许先只写类型与 API，不接队列）

API 返回类型不要使用 `any`。

## 验收

- [x] `Soybean/123456` 返回 `{ data: { token, refreshToken }, error: null }`，互斥类型不允许 data/error 同时有值或同时为 null
- [x] 错误凭证返回 `{ data: null, error: { kind: 'backend', code: '1001' } }`，Chrome Runtime 无 Uncaught
- [x] 断网为 `network/ERR_NETWORK`，HTTP 500/404 为 `http` + status/code，业务失败为 `backend`，AbortController 为 `cancelled/ERR_CANCELED`
- [x] 无 token/清理 token 时 Mock 收到 `authorization=null`，storage token 时收到 `Bearer storage-token`，调用方显式 `Authorization` 不被覆盖
- [x] request 核心不 import Router、Pinia、store 或 Vue 页面，不调 `window.location`
- [x] `bun install --frozen-lockfile`、`bun run typecheck`、`bun run build` 通过

R08 实际证据（2026-08-24）：

- 安装 Axios `1.19.0`，未安装 axios-retry；`FlatResult<T>` 使用成功/失败联合类型，临时构造非法双值/双 null 时 vue-tsc 拒绝；
- `createFlatRequest` 配置 baseURL/10s timeout/JSON header，请求拦截器仅在 token 非空且调用方没传 Authorization 时添加 `Bearer`；
- 错误分类实测：backend `1001/1002/1234`、HTTP `500/404`、network `ERR_NETWORK`、cancelled `ERR_CANCELED`；所有失败都保持 `data=null`；
- storage key 为 `SOY_token` / `SOY_refreshToken`，无 token 不发空 header，有 token 发 `Bearer storage-token`，显式 `Explicit token` 原样到达 Mock；
- auth API 已提供 `fetchLogin`、`fetchGetUserInfo`、`fetchRefreshToken`、`fetchCustomBackendError`；refresh 正确凭证返回新 mock token，错误凭证为 backend `1002`；
- 会话码回调实测：`8888 → onLogout`、`7777 → onModalLogout`、`9999 → onTokenExpired`，普通 `1234` 不触发；回调自身抛错时 `8889` 仍返回 backend flat error；
- 本地 Mock 新增 getUserInfo/refresh/error/HTTP 500/delay 路由，日志确认请求路径均已去除 `/proxy-default`；
- Chrome 动态 import API/request/storage 并执行全部契约，Runtime exception 监听为空；
- 生产构建转换 55 个当前应用模块；request/API 尚未被页面 import，所以 Axios 代码按预期被 tree-shake，R09 接入 auth store 后进入主 bundle。

## 常见坑

- **返回 AxiosResponse**：调用方又变成 `.data.data`，flat 协议失去意义。
- **只用 HTTP 200 判成功**：后端可能以 200 返回业务失败。
- **拦截器里接管路由**：请求层与 UI 导航强耦合，也会让测试困难。
- **并发过期请求各自刷新**：若实现加分项，refresh 只能单飞，其余请求入队。

## 思考题

1. 为什么「网络重试」和「token 刷新后重放」不是同一种重试？
2. flat 结果与抛异常各适合什么调用场景？

## 不要做

- 不要引入 Alova
- 不要在拦截器里写 `window.location.href = '/login'`
- 不要提前抽 workspace 包
