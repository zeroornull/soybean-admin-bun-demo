# 03 · 架构对照与简化决策

## 原架构（逻辑分层）

```text
views ──► layouts ──► router(guard) ──► store(auth/route/tab)
                │                           ▲
                │                           │
                └── service/request ────────┘
                         ▲
                         │
                    @sa/axios ──► axios
```

页面几乎不直接打 HTTP。登录走 `auth-store`，菜单来自 `route-store`，主题来自 `theme-store`，布局只消费 store。

## 重写要保持的数据流

1. **token 在 localStorage，用户信息在 Pinia。** 刷新页面先读 token，再拉 userInfo。
2. **路由分两拨：constant（登录/404 等）和 auth（业务页）。** 未登录不能进 auth。
3. **菜单从「当前用户可见的路由表」推导**，不要在菜单组件里再维护一份硬编码。
4. **请求层负责协议**（code、token、刷新），**store 负责业务状态**，**guard 负责跳转**。不要在 axios 拦截器里 `router.push` 搅成一团，可以对标 legacy：拦截器调 `authStore.resetStore()`，由 store 去跳登录。

## 新旧目录

| 原路径 | 新路径（建议） | 何时出现 |
| --- | --- | --- |
| `legacy/src/main.ts` | `src/main.ts` | R02 |
| `legacy/src/App.vue` | `src/App.vue` | R02 |
| `legacy/src/plugins/*` | `src/plugins/*` | R02 起，先 loading |
| `legacy/src/styles/*` | `src/styles/*` | R03 |
| `legacy/src/router/*` | `src/router/*` | R04 |
| `legacy/src/layouts/*` | `src/layouts/*` | R05 |
| `legacy/src/store/*` | `src/store/*` | R06 |
| `legacy/src/service/*` | `src/service/*` | R07 环境边界，R08 request/API |
| `legacy/packages/axios` | 先内联，R19 锁定回归后，R20 再决定是否 `packages/axios` | R08 / R20 |
| `legacy/src/views/_builtin/login` | `src/views/login` | R09 数据流，R15 页面交付 |
| `legacy/src/views/home` | `src/views/home` | R04 占位，R16 交付 |
| `legacy/src/locales` | `src/locales` | R13 |
| `legacy/src/theme` | `src/theme` | R14 |
| `legacy/packages/materials` | R05 自己写简易 layout，主线不抽 materials | R05 |
| `legacy/build/*` | 合并进 `vite.config.ts`，配置大了再拆 `build/` | R01 起 |
| `legacy/src/router/elegant/*` | **不生成**，手写 `src/router/routes.ts` | R04 / R10（Elegant 仅加分） |
| `legacy/packages/scripts` | 不做 | — |
| `legacy/packages/alova` | 不做 | — |

完整表：[mapping/directory.md](./mapping/directory.md)

## 有意简化的点

### 1. 单包到 workspace 的时机

原项目一上来就是 7 个内部包。学习时这会让「改一行 hooks 要搞清 workspace 协议」挡住主线。

- R01–R19：全部放 `src/`，R19 先用回归测试锁定行为
- R20：只抽 **确实被多处复用、且没有 Vue 页面依赖** 的模块（utils、axios 工厂、color）
- materials（Vue 组件）可以留在 `src/components/layout`，除非你真的要单独发包

### 2. 路由生成器后置

Elegant Router 的价值是「views 目录即路由」。代价是生成文件、类型命名空间、插件配置。

学习路径：

1. R04 手写 `RouteRecordRaw`
2. R10 自己实现 static 过滤（按角色）
3. A03：本地扫描 `src/views`，生成 Elegant 描述并变换为 vue-router；不装 `@elegant-router/vue`（Prettier / unplugin 1.x）

### 3. 布局变体

原主题抽屉支持 6+ 种 layout mode。R05 先做 `vertical`。A04 补齐 6 个 mode 名：同一份路由菜单投到 sider/header，不引入 `@sa/materials`。A05 用 Naive 抽屉编辑圆角、水印、预设和区块开关。

### 4. 登录模块

原登录有 5 个 module。R09 先跑通账密登录数据流，R15 再交付完整页面。验证码 / 注册 / 重置仍是主线外加分项。

### 5. CLI 与 changelog

`pnpm sa gen-route` / `sa git-commit` / `sa release` 不进入主线。需要生成路由时写一个 30 行的 bun 脚本即可。

## 建议的新 src 结构（R17 结束时）

```text
src/
├── main.ts
├── App.vue
├── assets/
├── components/          # 通用组件
├── layouts/
│   ├── base-layout.vue
│   └── blank-layout.vue
├── views/
│   ├── login/
│   ├── home/
│   └── _builtin/        # 403 404 500
├── router/
│   ├── index.ts
│   ├── routes.ts
│   └── guards.ts
├── store/
│   ├── index.ts
│   ├── app.ts
│   ├── auth.ts
│   ├── route.ts
│   ├── tab.ts
│   └── theme.ts
├── service/
│   ├── request.ts
│   └── api/
├── locales/
├── styles/
├── theme/
├── hooks/
├── utils/
└── types/
```

命名不必与 legacy 的 `modules/app/index.ts` 完全一致。**store 五个职责要对上**，文件怎么切随你。

## 启动顺序（重写时遵守）

与 legacy 对齐，避免「router 用到 pinia 但 pinia 还没 use」：

```ts
const app = createApp(App);
setupStore(app);
await setupRouter(app);
setupI18n(app);
app.mount('#app');
```

样式、UnoCSS、Naive 的按需/全局配置放在 mount 之前完成。

## 类型策略

- `strict: true`
- `moduleResolution: "bundler"`
- 环境变量写成 `src/types/env.d.ts` 的 `ImportMetaEnv`，不要满项目 `as any`
- API 类型放 `src/types/api.d.ts`，用 namespace 或模块导出都可以；legacy 用 `namespace Api`，学的时候模块导出更直观

## R22 收口：六条核心数据流

1. **启动链**：`setupLoading` → `createApp` → `setupStore`（Pinia、app/theme/auth、请求会话回调）→ `setupRouter`（守卫 + `isReady`）→ `setAuthNavigator` → `setupI18n` → `mount`。store 必须在 router 之前注册。
2. **登录 / 恢复 / 登出**：登录只走 auth store：`fetchLogin` 写双 token → `getUserInfo`。刷新走 `initSession` 单飞：有 storage token 再拉 userInfo，失败则 `resetStore`。登出清 token、userInfo、auth routes、tabs，再由 navigator 带 `redirect` 回登录。
3. **守卫**：先标记 constant 并 rematch；再 `initSession`。未登录只能留在 login/真正 constant/未知非业务 path，否则跳 login。已登录若尚未 `addRoute` 则注入过滤后的 auth 路由再 rematch；已登录访问 login 去首页；业务未知 path 转 403；无角色转 403。
4. **请求**：仅 `DEV && VITE_HTTP_PROXY=Y` 时用 `/proxy-default`，生产直连 `VITE_SERVICE_BASE_URL`。成功码给出 `{ data, error: null }`；logout/modal 码清会话；**expired 码单飞 refresh 后重放一次**，失败才登出；HTTP 有响应为 `http`，无响应为 `network`，取消为 `cancelled`。
5. **投影**：守卫过滤后的 auth routes → 菜单；`route.matched` → 面包屑；route name → tab id；`componentName` → KeepAlive include。关 tab 时同步丢掉 cache name。
6. **locale / theme**：locale 只经 app store 写入，同步 Vue I18n、dayjs、`html lang`、storage；Naive 跟同一状态。theme 持久化 scheme 与主色，`darkMode` 只派生；同时写 CSS 变量和 Naive overrides。
