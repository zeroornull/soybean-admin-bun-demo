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

- `constantRoutes`：login、403、404（R17 再补 500 交付）；
- `authRoutes`：root/base layout、home 与后续业务页；
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

- [x] 匿名直达 `/home?from=direct#section` → `/login?redirect=/home?from=direct%23section`，而真实未知 `/totally-unknown` 仍为 404
- [x] 超管登录后合法 redirect 完整恢复 path/query/hash，返回 `/home?from=direct#section`
- [x] 超管和普通用户已登录后访问 `/login` 都被守卫导向 `/home`
- [x] `User/123456` 的 `R_USER` 访问 `/restricted` → `/403`，route-store/router 都无 restricted；`Soybean/R_SUPER` 可直接访问
- [x] 超管在 `/restricted` 刷新后 session 恢复、auth routes 重新 add、页面仍为 restricted，不落 404/白屏/循环
- [x] Logout 后 `router.hasRoute(root/home/restricted)=false`、authorizedRouteNames 清空；普通→退出→超管后 restricted 可再注册
- [x] R09 `main.ts` 中 `initSession + meta.requiresAuth` 临时分支已删除，会话初始化和重定向由 beforeEach 接管
- [x] `bun install --frozen-lockfile`、`bun run typecheck`、`bun run build` 通过，构建无 circular/ineffective dynamic import warning

R10 实际证据（2026-08-24）：

- `.env` 新增 `VITE_AUTH_ROUTE_MODE=static`、`VITE_ROUTE_HOME=home`、`VITE_STATIC_SUPER_ROLE=R_SUPER`，env 类型严格限定 static/dynamic；主线只实现 static，dynamic 被选择时明确报未实现；
- routes 已拆成 constant（login/403/404）与 auth（root/base + home/restricted），Router 初始只注册 constant + catch-all；
- `RouteMeta` 类型已补 constant/requiresAuth/roles/title/hideInMenu；restricted 要求 `R_NOBODY`，同时新增 403 与 restricted 页面；
- route-store 实现 `hasRoutePermission`、`filterAuthRoutesByRoles`、constant/auth initialized 状态、authorizedRouteNames、`router.addRoute` remove 函数数组与业务 `resetStore()`；
- beforeEach 以早返回实现：constant init/rematch → initSession → 匿名 constant/protected/unknown 分流 → 已登录 auth add/rematch → login 反跳 → 未注册但存在的 auth path 进 403 → meta roles 兜底；
- rematch 使用分开的 `to.path/to.query/to.hash`，不把 fullPath 塞进对象 path；登录 redirect 仍保留 fullPath；
- afterEach 将标题设为 `页标题 | SoybeanAdmin`，Chrome 实测 Login/Home/Restricted/403/404 标题正确；本轮未引入 nprogress；
- auth-store 新增 `sessionInitialized`，守卫中反复 `initSession()` 不重复拉 userInfo；main 只在 Router ready 后注入 logout navigator，消除 auth↔router/guard 模块环；
- Mock 新增 `User/123456 → mock-user-access-token → R_USER`，超管仍为 `Soybean/123456 → R_SUPER`；README 已记录两组账号；
- Chrome 实测矩阵全通过：匿名 protected/unknown/403；超管 redirect/restricted/刷新/login 反跳/unknown 404/Logout remove；普通 restricted→403/home/再 restricted→403/login 反跳；最后切回超管重新 add restricted，Runtime exception 为空；
- 生产构建转换 117 个模块，生成 403/restricted 独立 lazy chunks，构建无 warning；未引入 Axios 到 guard、未接 Elegant Router、未实现动态模式。

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
