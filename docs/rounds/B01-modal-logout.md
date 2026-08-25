# B01 · 弹窗登出码

A01 把过期码改成刷新。`8888` 仍直接登出。本轮补上 `7777`/`7778`：先对话框，确认才清会话。

## 学习目标

- 三种会话码职责不同：直接登出、弹窗登出、过期刷新
- 工厂只回调 `onModalLogout`，弹窗状态在应用层
- 并发 7777 只弹一次；取消后 token 还在

## 对照

- `legacy/src/service/request/index.ts` 的 `modalLogoutCodes`
- 当前 `src/store/index.ts` 把 `onModalLogout` 和 `onLogout` 接到同一个 `resetStore`

## 边界

- UI 用 `NModal`，不引入 `window.$dialog`
- 首页「模拟弹窗登出」打 `/auth/error?code=7777`
- 确认 → `resetStore` 回登录；取消 → 留在首页
- 8888 仍直接登出，9999 仍走 A01
- 不改守卫决策树，不加业务 CRUD

## 验收

- [x] `7777` 弹出对话框，不立刻清 token
- [x] 取消后仍是登录态；确认后到登录页
- [x] 并发两次 7777 只弹一次，确认只登出一次
- [x] `bun run quality` 通过
- [x] Chrome：模拟弹窗登出 → 取消仍在首页 → 再确认回到登录

B01 实际证据（2026-08-25）：

- 工厂仍只回调 `onModalLogout`；应用层 `createModalLogoutController` 单飞，取消不 `resetStore`；
- 94 tests 全绿；`bun run quality` + `bun run build` 通过；
- Chrome：点「模拟弹窗登出」出现对话框且 `SOY_token` 仍在；取消后仍在 `/home`、用户 Soybean；再确认后到 `/login`，token 为空。

## 不要做

- 不要把 HTTP 500 / 普通业务码改成弹窗
- 不要改 expired 刷新
- 不要装 nprogress / @vueuse/core
