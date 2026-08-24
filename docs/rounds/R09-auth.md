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
- `userInfo: reactive({ userId, userName, roles, buttons })`
- `isLogin = computed(() => Boolean(token.value))`
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

### 6. 临时页面保护

R10 守卫完成前，允许 home 在 mounted 时将未登录用户导向 login。R10 通过后必须删掉这个临时分支。

## 验收

- [ ] 正确账号登录后 token 与 userInfo 同时就绪，header 显示用户名
- [ ] 错误密码停留在登录页，不留残缺 token
- [ ] 刷新 `/home` 会调用 getUserInfo 并恢复会话
- [ ] 伪造或失效 token 最终被清理，不白屏、不死循环
- [ ] 退出后 auth / route / tab 状态清空，token 从 localStorage 消失
- [ ] `bun run typecheck` 通过

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
