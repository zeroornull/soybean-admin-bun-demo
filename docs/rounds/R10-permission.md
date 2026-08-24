# R10 · 导航守卫与静态权限路由

## 学习目标

- 实现与 legacy 同构的 `beforeEach` 决策树
- 将 constant 路由与 auth 路由分开初始化
- 在静态模式下按用户 roles 过滤可见路由，正确注册与移除
- 理解前端路由权限只是 UI 门禁，后端 API 才是安全边界

## 对照 legacy

- `legacy/src/router/guard/route.ts`
- `legacy/src/router/guard/index.ts`
- `legacy/src/store/modules/route/index.ts`
- `legacy/src/store/modules/route/shared.ts`
- `legacy/src/router/routes/builtin.ts`
- `legacy/.env` 的 `VITE_AUTH_ROUTE_MODE`、`VITE_STATIC_SUPER_ROLE`

## 本轮必须落地的决策树

对每次 `to`：

1. 若会话仍在初始化，先等待 R09 的 `initSession()` 结束；
2. 若常量路由未初始化，先 init，再 `replace` 原地址；
3. 已登录访问 login，跳 root/home；
4. `meta.constant` 直接放行；
5. 需登录但没 token，跳 login 并带 `redirect=to.fullPath`；
6. 已登录但 roles 不匹配，跳 403；
7. 其余放行。

守卫实现尽量用早返回表达，不要写成多层嵌套的 if/else。

## 动手步骤

### 1. 拆分路由表

- `constantRoutes`：root、login、403、404、500；
- `authRoutes`：home 与后续业务页；
- 全局 not-found 兜底。

router 初始只注册 constant + not-found，完成会话恢复后再按 roles 过滤 auth routes 并 `addRoute`。

若暂时用「一开始注册全部路由，守卫只拦截」的过渡方案，可以学会决策树，但不算本轮最终验收完成。

### 2. 实现 roles 过滤

`meta.roles` 为空表示任意已登录用户可见；有值时至少匹配一个角色。静态模式下，包含 `VITE_STATIC_SUPER_ROLE` 的用户跳过过滤。

建一个临时 `R_NOBODY` 受限页用于验证 403，R22 收尾时删除或明确标为 demo。

### 3. 管理动态注册的生命周期

`router.addRoute` 返回 remove 函数。route store 保存这些函数，登出或切换账号时统一执行，避免同名路由重复注册。

### 4. 处理首次导航与 404

auth 路由还没 add 时，首次直达 `/home` 可能先命中 not-found。对照 legacy 的 `isNotFoundRoute` 与初始化后 replace 逻辑，保证原 path 只重进一次，不形成死循环。

### 5. 标题与导航进度

`document.title` 必须跟随 route meta。nprogress 可以安装，也可暂时省略；它不得影响守卫的 return 路径。

### 6. 动态模式仍为加分项

后端下发的 JSON 不能序列化 Vue 组件函数。如实现动态模式，需要明确的 route key → view import 映射，或在主线全部通过后再引入 Elegant Router。

## 验收

- [ ] 未登录直达 `/home` → `/login?redirect=/home`
- [ ] 登录后若存在合法 redirect，回到原页
- [ ] 已登录访问 `/login` → `/home`
- [ ] 普通角色访问受限页 → `/403`，超管可访问
- [ ] 刷新受保护页不先落到 404，不白屏、不循环
- [ ] 登出后动态 add 的路由已 remove
- [ ] 删除 R09 的页面级临时保护
- [ ] `bun run typecheck` 通过

## 常见坑

- **守卫 async 分支没 return**：同一次导航同时放行和重定向。
- **先注册 404，后 add auth route 但不重进**：首次直达被兜底吃掉。
- **只添加不移除**：切换账号后仍能访问上个账号的页面。
- **把客户端角色判断当安全边界**：API 仍必须在服务端验权。

## 思考题

1. constant route 与 auth route 是「是否懒加载」的区别，还是「是否受会话约束」的区别？
2. 为什么前端隐藏菜单不能替代后端权限校验？

## 不要做

- 不要在守卫里直接调 Axios，统一走 store / service
- 不要在主线未通过时接 Elegant Router
- 不要用菜单是否可见判断 API 是否可调
