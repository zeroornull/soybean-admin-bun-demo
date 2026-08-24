# R09 · 登录、会话恢复与登出

## 学习目标

- 把「输入账号 → token → userInfo → 进首页」串成一条 auth store action
- 明确 Pinia 内存状态与 localStorage 持久化各自的责任
- 冷启动时恢复会话，失败时收敛到可预期的未登录状态
- 登出时同步清理 token、用户信息、权限路由与页签状态

## 对照 legacy

- `legacy/src/store/modules/auth/index.ts`
- `legacy/src/store/modules/auth/shared.ts`
- `legacy/src/hooks/business/auth.ts`
- `legacy/src/views/_builtin/login/modules/pwd-login.vue`
- `legacy/src/service/api/auth.ts`
- `legacy/src/utils/storage.ts`

## 动手步骤

### 1. 完成 auth store

对齐这些字段和 action：

- `token: ref('')`
- `userInfo: ref<UserInfo | null>(null)`
- `isLogin = computed(() => Boolean(token.value && userInfo.value))`
- `login(userName, password)`
- `initSession()`
- `getUserInfo()`
- `resetStore()`

`login` 的成功顺序必须是：保存 token → 拉 userInfo → 确认会话完整 → 导航。只有 token 没有 roles 的中间态不能当作已完成登录。

### 2. 接入 R08 的会话失效回调

request 层只上报协议事件；auth store 负责执行业务收尾：

- 清理 storage；
- reset auth / route / tab；
- 将用户导向 login；
- 需弹窗的码先通知用户，再执行同一个 reset 路径。

注意 store 之间的循环依赖：在 action 函数体内再取其他 store，不在模块顶层取实例。

### 3. 应用启动时恢复会话

`initSession()` 只读取已存 token：

1. 无 token：直接结束；
2. 有 token：写入 store 并请求 userInfo；
3. userInfo 失败：统一 `resetStore()`；
4. 不论成功失败，都要结束 initializing 状态。

本轮允许在 `setupRouter` 前后由 `main.ts` 显式调用；R10 再将「导航前必须完成的会话初始化」纳入守卫决策树。

### 4. 最小登录表单

保留用户名、密码、提交和错误提示即可。本轮验证数据流，R15 再改成完整 Naive UI 页面。

### 5. header 用户区

显示 `userInfo.userName`，并提供退出入口。退出必须走同一个 `resetStore()`，不在组件里分散地删 storage key。

### 6. 临时受保护路由跳转

R10 守卫完成前，`main.ts` 在 `router.isReady()` + `authStore.initSession()` 后检查初始 route；未登录且 `meta.requiresAuth` 时，mount 前导向带 redirect 的 login。R10 通过后必须删掉这个临时分支。

## 验收

- [x] `Soybean/123456` 登录后 access/refresh token 与 userInfo 同时就绪，roles 包含 `R_SUPER`，Header 显示 Soybean
- [x] 错误密码停留 `/login?redirect=/home`，显示 `Invalid user name or password`，auth/storage 无任何残缺 token
- [x] 刷新 `/home` 后内存 store 重建，`initSession()` 从 storage 恢复 token，请求 getUserInfo 后 Header 再次显示 Soybean
- [x] 冷启动伪造 token 时 getUserInfo 返回 `8888/Session expired`，会话回调清理 storage/state 并进入 `/login?redirect=/home?invalid=1`，无白屏/循环
- [x] 退出前人工写入 route menus/tab，点 Header Logout 后 auth/route/tab 恢复默认，access/refresh storage 均消失
- [x] `bun install --frozen-lockfile`、`bun run typecheck`、`bun run build` 通过，构建无 warning

R09 实际证据（2026-08-24）：

- auth-store 现包含 token/refreshToken/userInfo/loading/initializing/authError/isLogin 与 login/getUserInfo/initSession/resetStore；`isLogin` 要求 token + userInfo 同时完整；
- login 顺序为 fetchLogin → 同步 Pinia/storage access+refresh token → fetchGetUserInfo → 确认完整会话；userInfo 失败会清理已写 token；
- `setupStore()` 创建空默认 auth-store 后注册 R08 会话回调，logout/modal/expired 目前都收口到同一 `resetStore({ reason })`；R14/R15 提供 UI provider 后再区分弹窗交互；
- resetStore 清理 auth memory + 双 storage key，在 action 体内延迟取 route/tab store 并 `$reset()`，然后导向 login；不存在 auth → route → tab → auth 递归；
- `main.ts` 启动顺序为 setupStore → setupRouter/isReady → initSession → 临时 requiresAuth 跳转 → mount，未写 `beforeEach`；
- 最小 Login 表单含用户名/密码/submit/loading/error，过滤外部、`//` 与 `/login` redirect，密码从不写入 storage；
- Mock getUserInfo 现只接受 `Bearer mock-access-token` / `Bearer mock-refreshed-access-token`，其他/空 header 返回 `8888`；另加 `/test/echo-auth` 保留 R08 header 回显边界；
- Chrome 完整流程实测：无 token 直达 Home → 错密码 → 正确登录 → 刷新恢复 → 写入 route/tab → Logout 全清 → 伪 token 冷启动清理，Runtime exception 监听为空；
- 同一 tick 连续两次 `initSession()` 时，Pinia 会包装 action 返回 Promise，所以外层引用不相等；但 Mock 新日志只出现一次 `GET /auth/getUserInfo`，内部 initSessionPromise 单飞成立；
- 生产构建转换 112 个模块，request/auth 已进入主应用；收窄 store barrel 与静态 router import 后构建无 `INEFFECTIVE_DYNAMIC_IMPORT` warning。

## 常见坑

- **token 写入后立即跳转**：userInfo 还没回来，R10 权限过滤会把 roles 当空数组。
- **初始化与登录同时发请求**：需要明确 initializing/loading 的状态边界。
- **reset 互相调用**：auth → route → tab → auth 形成递归。收口函数只能有一个总协调者。
- **redirect 指回 login**：需过滤无效 redirect，R10 再完整处理。

## 思考题

1. token 只放 Pinia、只放 localStorage、两者都放，刷新时分别会发生什么？
2. 两个账号先后登录，上个账号的 tab 和权限路由为什么不能保留？

## 不要做

- 不要现在做动态路由接口
- 不要做验证码、注册、微信等登录模块
- 不要将密码持久化或写进仓库
