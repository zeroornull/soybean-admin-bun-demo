# 01 · 原项目盘点（legacy）

以下均相对于 `legacy/`。这是 2026-08-24 归档时的快照，版本号以 `legacy/package.json` 为准。

## 它是什么

Soybean Admin 2.2.0：Vue 3 后台模板。官方定位是 Naive UI 版（另有 Ant Design Vue / Element Plus 分支，不在本仓库）。

## 技术栈（归档时）

| 层 | 选用 | 版本 |
| --- | --- | --- |
| 包管理 | pnpm workspace | engines: pnpm >= 10.5，node >= 20.19 |
| 构建 | Vite | 8.0.12 |
| 语言 | TypeScript | 6.0.3 |
| 框架 | Vue | 3.5.34 |
| 路由 | vue-router | 5.0.7 |
| 状态 | Pinia | 3.0.4 |
| UI | naive-ui | 2.44.1 |
| 原子化 CSS | UnoCSS `presetWind3` | ^66.6.8 |
| i18n | vue-i18n | 11.4.2 |
| 工具库 | @vueuse/core | 14.3.0 |
| 图表 | echarts | 6.0.0 |
| HTTP | axios + axios-retry（`@sa/axios`） | axios 1.16.0 |
| 文件路由生成 | @elegant-router/vue | 0.3.8 |
| lint/format | oxlint + eslint + oxfmt | eslint 10.3.0 |
| git hook | simple-git-hooks | 2.13.1 |

应用入口已经是 ESM（`"type": "module"`）。

## 仓库形态

pnpm monorepo：

```text
legacy/
├── package.json              # 应用本体
├── pnpm-workspace.yaml       # packages/*
├── src/                      # 后台应用
├── packages/                 # 内部包
│   ├── axios/                # @sa/axios      正在使用
│   ├── utils/                # @sa/utils      正在使用
│   ├── hooks/                # @sa/hooks      正在使用
│   ├── color/                # @sa/color      登录页/主题在用
│   ├── materials/            # @sa/materials  布局、页签组件
│   ├── uno-preset/           # @sa/uno-preset UnoCSS 预设
│   ├── scripts/              # @sa/scripts    sa CLI（commit/release/gen-route）
│   └── alova/                # @sa/alova      仓库里有，应用未作为默认请求库
├── build/                    # Vite 插件与代理配置
└── public/
```

`pnpm-workspace.yaml` 打开了 `shamefullyHoist` 与 `linkWorkspacePackages`。Bun 侧对应关系见 [cheatsheets/pnpm-to-bun.md](./cheatsheets/pnpm-to-bun.md)。

## 应用启动链

`legacy/src/main.ts` 的顺序值得背下来，重写时按同一条链搭：

1. 引入静态资源（`plugins/assets`）
2. `setupLoading` — 首屏加载动画
3. `setupNProgress` — 顶部进度条
4. `setupIconifyOffline`
5. `setupDayjs`
6. `createApp(App)`
7. `setupStore` — Pinia + setup-store 的 `$reset` 插件
8. `await setupRouter` — 注册路由并 `router.isReady()`
9. `setupI18n`
10. 版本更新提示、transition 根节点校验
11. `app.mount('#app')`

`App.vue` 用 `NConfigProvider` 注入 Naive UI 主题 / 语言，再套 `AppProvider` 与 `RouterView`。

## 核心模块（按重要度）

### 1. 路由

- 创建：`legacy/src/router/index.ts`
- 内置路由（root / login / 403 / 404 / 500）：`legacy/src/router/routes/builtin.ts`
- 文件路由产物：`legacy/src/router/elegant/*`（由 Elegant Router 生成）
- 守卫：`legacy/src/router/guard/route.ts`
  - 未初始化常量路由 → 先 init 再重进
  - 已登录访问 login → 去首页
  - `meta.constant` 免登录
  - 未登录 → login，带 `redirect`
  - 无角色 → 403

权限模式由 `VITE_AUTH_ROUTE_MODE=static | dynamic` 控制。静态模式用前端生成的路由表；动态模式向 `/route` 接口拉用户路由。

### 2. 状态（Pinia setup 语法）

`legacy/src/enum/index.ts` 里的 store id：

- `app-store` — 语言、重载、菜单折叠、设备宽度
- `theme-store` — 布局模式、主题色、暗黑、水印、Naive 主题覆盖
- `auth-store` — token、用户信息、登录/登出
- `route-store` — 常量路由、权限路由、菜单、面包屑
- `tab-store` — 多页签、缓存、固定页签

setup 语法没有内置 `$reset`，所以有 `legacy/src/store/plugins/index.ts` 给这五个 store 补上。

### 3. 请求

`legacy/src/service/request/index.ts` 调用 `@sa/axios` 的 `createFlatRequest`：

- 成功：`response.data.code === VITE_SERVICE_SUCCESS_CODE`（默认 `0000`）
- 业务失败码分流：登出 / 弹窗登出 / token 过期刷新
- 请求头带 `Authorization`
- transform 后直接得到 `data` 字段（flat 模式）

API 很少：登录、用户信息、刷新 token、用户路由。Mock 走 ApiFox。

### 4. 布局

`legacy/src/layouts/base-layout/index.vue` 组装 `@sa/materials` 的 `AdminLayout`，再插入 header / sider / tab / content / footer / theme-drawer / menu。布局模式有 vertical、vertical-mix、horizontal 以及若干 hybrid。

### 5. 页面

本仓库的 `views` **比完整演示版瘦**：

- `_builtin`：登录（账密 / 验证码 / 注册 / 重置 / 绑微信）、403、404、500、iframe
- `home`：卡片、折线、饼图、动态、banner

没有系统管理、多级菜单演示页。重写时按这个范围做功能对等即可。

## 环境变量（必须理解）

`legacy/.env` 是配置中枢，类型在 `legacy/src/typings/vite-env.d.ts`。重点：

| 变量 | 作用 |
| --- | --- |
| `VITE_BASE_URL` | 应用 public path |
| `VITE_AUTH_ROUTE_MODE` | static / dynamic |
| `VITE_ROUTE_HOME` | 登录后的首页 route key |
| `VITE_HTTP_PROXY` | 开发代理开关 |
| `VITE_ROUTER_HISTORY_MODE` | hash / history / memory |
| `VITE_SERVICE_SUCCESS_CODE` | 后端成功码 |
| `VITE_SERVICE_LOGOUT_CODES` | 直接登出 |
| `VITE_SERVICE_MODAL_LOGOUT_CODES` | 弹窗后登出 |
| `VITE_SERVICE_EXPIRED_TOKEN_CODES` | 刷新 token 并重放 |
| `VITE_STATIC_SUPER_ROLE` | 静态模式超管角色 |
| `VITE_STORAGE_PREFIX` | localStorage 前缀 |

服务地址在 `.env.test` / `.env.prod` 的 `VITE_SERVICE_BASE_URL`。

## 工程化

- 路径别名：`@` → `src`，`~` → 仓库根
- `vue-tsc --noEmit --skipLibCheck`
- pre-commit：typecheck + lint + fmt，且要求工作区干净
- 淘宝镜像：`legacy/.npmrc` 里 `registry=https://registry.npmmirror.com/`
- 开发端口 9527，preview 9725

## 对重写有影响的「坑」

1. **Elegant Router 是生成代码**。`elegant/imports.ts`、`elegant/routes.ts` 不要当手写源。学习阶段用手写路由表。
2. **Alova 包是备选**，不要在默认路径里引入。
3. **setup store 的 `$reset` 是自己补的**，登出时 `authStore.$reset()` 依赖这个插件。
4. **扁平请求**（`createFlatRequest`）让调用方拿到 `{ data, error }`，不是 Axios 原始 response。
5. **本仓库页面很少**，不要按官网截图去补一堆演示页，除非你主动加范围。

更细的目录 / 依赖表见 `mapping/`。
