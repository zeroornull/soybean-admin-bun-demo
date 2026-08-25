# A01 · token 刷新单飞与请求重放

主线 R00–R22 已结束。本轮是加分项，不阻塞主线 done。

## 学习目标

- 区分 logout 码、modal logout 码和 **expired token 码**
- 过期时刷新 access/refresh token，而不是立刻登出
- 并发请求只触发 **一次** refresh（单飞），成功后重放原请求
- refresh 接口本身不得再走刷新逻辑，避免死循环

## 对照

- `legacy/src/service/request/index.ts` 的 `expiredTokenCodes`
- `legacy/src/service/request/shared.ts` 的 `handleExpiredRequest`
- 当前 `@sa/axios` 把三种会话码都交给 `resetStore`

## 边界

- 工厂仍在 `@sa/axios`，不 import Pinia
- 刷新策略在 auth store：读 refresh token、写回 storage、失败再 `resetStore`
- 不实现弹窗登出码（A 系列其它项）
- 不引入 `axios-retry`

## 动手步骤

1. `@sa/axios` 在 expired 码上调用 `refreshSession()`；并发共用同一个 Promise。
2. 成功则去掉旧 `Authorization` 后重放 **一次**；失败走 `onTokenExpired`。
3. `fetchRefreshToken` 设 `skipExpiredRefresh: true`。
4. Mock：过期 access token 返回 `9999`；合法 refresh 返回新 token。
5. 回归：单飞、重放、失败登出、refresh 自身不递归。

## 验收

- [x] 过期码刷新成功后，原请求拿到新 token 的成功结果，页面不跳登录
- [x] 两个并发过期请求只调用一次 `refreshSession`
- [x] refresh 失败会登出并清 token
- [x] `bun run test` 与 `bun run quality` 通过

A01 实际证据（2026-08-25）：

- `@sa/axios` 对 expired 码单飞调用 `refreshSession`，成功后去掉旧 Authorization 再重放一次；`skipExpiredRefresh` 避免 refresh 接口递归；
- auth store `refreshSession` 写回双 token，失败才 `resetStore`；
- Mock：`mock-expired-access-token` → `9999`，`mock-refresh-token` → 新 access；
- 26 tests 全绿，含并发单飞与失败登出；
- Chrome：登录后点「模拟 token 过期」，`/test/protected` 先 9999 再 refresh 再 200，storage 变为 `mock-refreshed-access-token`，仍停在 `/home`。
