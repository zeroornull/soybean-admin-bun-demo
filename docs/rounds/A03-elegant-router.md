# A03 · Elegant Router 与文件即路由

主线仍用手写 vue-router 的守卫和 addRoute。本轮补上 Soybean 的文件约定：`src/views` 的页面文件生成路由名、path 和 `layout.x$view.y` 组件串。

## 学习目标

- 分清 **扫描文件**、**Elegant 描述**、**vue-router 记录** 三层
- `_builtin` 前缀不进路由名；文件夹里的 `_` 会变成 path 分段（`user_detail` → `/user/detail`）
- 单层页的 `layout.base$view.home` 会拆成 layout 父级 + `path: ''` 的 view 子级
- 不安装 `@elegant-router/vue`：它依赖 Prettier 和 unplugin 1.x，和 D24（oxfmt 独占）冲突；`@elegant-router/types` 也不是 npm 包

## 对照

- `legacy/build/plugins/router.ts`
- `legacy/src/router/elegant/{imports,routes,transform}.ts`
- `legacy/src/router/routes/{index,builtin}.ts`
- `@elegant-router/core` 的 glob → name/path 规则

## 边界

- 默认仍是 `VITE_AUTH_ROUTE_MODE=static`；A02 白名单不自动等于全部 views
- 403/404/500 的 **vue-router name** 仍是 `forbidden` / `not-found-page` / `server-error`，避免改守卫和 i18n
- 同一 `layout.base` 的业务页收进一个 `root`，避免官方「每个一级页一个 layout 实例」打掉 R12 KeepAlive
- 不扩业务 CRUD，不加 iframe / 多级菜单页面

## 动手步骤

1. 用 `parsePageGlob` 实现官方文件约定，并给 `_` 分段、`_builtin`、`[id].vue` 写测试。
2. 手写 `transformElegantRoutesToVueRoutes`：单层看 `$`，而不是只看 name 里有没有 `_`（我们要保留 `home` 这个 name）。
3. `bun run gen:routes` 生成 `src/router/elegant/imports.ts` 和 `routes.ts`；Vite 插件在 dev/build 时也会跑。
4. `config.ts` 里写 layout、constant、name/meta 覆盖。
5. `groupAuthElegantRoutes` 把 home/restricted 收到 `/` 下。

## 验收

- [x] 新增 `src/views/foo/index.vue` 会进入生成表（测试锁定当前 views 与 committed 文件一致）
- [x] `_builtin/403` → path `/403`、component `layout.blank$view.403`、路由 name `forbidden`
- [x] `layout.base$view.home` 变换为 layout 包裹；auth 侧仍是单个 `root` + 相对 path 子级
- [x] 未安装 `@elegant-router/vue` / Prettier
- [x] `bun run quality` 通过
- [x] Chrome：登录、首页、受限页 403、未知 path 404、home↔restricted KeepAlive

A03 实际证据（2026-08-25）：

- 未安装 `@elegant-router/vue`；`bun run gen:routes` + Vite 插件（`bun scripts/gen-routes.ts`）生成 `imports.ts` / `routes.ts`；
- `_builtin/403` → `/403` + `layout.blank$view.403`，vue-router name 覆盖为 `forbidden`；
- auth 页收进单个 `root`，home 计数从 0→1 后去受限页再回来仍是 1（KeepAlive）；
- 44 tests 全绿；`bun run quality` 与 prod build 通过；
- Chrome：login `data-layout=blank`；超管菜单有受限页；User 菜单无受限页，直达 `/restricted` → `/403`；`/totally-unknown` 保留 URL 且 `data-page=not-found`。

## 不要做

- 不要为了「更像官方」把路由 name 改成 `403` 而大改守卫
- 不要把后端 JSON 的 component 改成任意 `import()`
- 不要做 A04 多 layout mode
