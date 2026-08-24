# R11 · 路由菜单与面包屑

## 学习目标

- 理解菜单是「当前用户可见路由」的 UI 投影，不是另一份手写 sitemap
- 从同一棵路由树推导侧栏、当前选中项和面包屑
- 处理隐藏菜单、空父级和动态参数等投影边界
- 保持 route store 管数据，layout 组件只渲染

## 对照 legacy

- `legacy/src/store/modules/route/shared.ts` 的 `getGlobalMenusByAuthRoutes`、`getBreadcrumbsByRoute`
- `legacy/src/store/modules/route/index.ts`
- `legacy/src/layouts/modules/global-menu/`
- `legacy/src/layouts/modules/global-breadcrumb/index.vue`
- `legacy/src/layouts/modules/global-sider/index.vue`

## 动手步骤

### 1. 补全 route meta 契约

```ts
interface RouteMeta {
  title: string;
  i18nKey?: string;
  icon?: string;
  order?: number;
  hideInMenu?: boolean;
  keepAlive?: boolean;
  constant?: boolean;
  roles?: string[];
}
```

本轮先用 `title`；R13 再使 `i18nKey` 跟随语言切换。不要把翻译后的字符串固化到 store。

### 2. 从 auth routes 生成菜单树

递归转换时：

- 跳过 `hideInMenu`；
- 保留 path、name、title/i18nKey、icon、children；
- 父节点无可见 children 且自身不可点时，不渲染空壳；
- 按 `order` 稳定排序；
- 使用已过滤的用户路由，不重复实现 roles 判断。

### 3. 用 Naive UI 或原生 nav 渲染

建议从这一轮开始安装 Naive UI：

```bash
bun add naive-ui
```

`NMenu` 的 key 选择稳定路由标识，不用当前语言的 label 作 key。选中态从当前 route 反推，不再建一份独立 ref。

### 4. 生成面包屑

主线先使用 `route.matched`，过滤没有 title/i18nKey 的布局壳。若菜单与路由层级不完全相同，再从菜单树建 name → ancestors 索引，不在组件里每次全树搜索。

### 5. 删掉 R05 的硬编码菜单

layout 只消费 route store 的 `menus`。login、403、404、500 不出现在业务菜单中。

## 验收

- [x] 登录后侧栏只显示当前用户有权且未隐藏的路由
- [x] 切换账号或登出后，菜单不残留上一个角色的项
- [x] URL 变化会正确更新菜单选中态，包括浏览器前进/后退
- [x] 面包屑与当前页层级一致，不把 blank/base layout 显示成业务节点
- [x] 侧栏中不再存在 R05 的手写业务列表
- [x] `bun run typecheck` 通过

R11 实际证据（2026-08-24）：

- 安装 `naive-ui@2.45.2`，侧栏改用 `NMenu`；key 固定使用 route name，点击时按 name 导航，不使用 label 作为状态标识；
- `routeStore.initAuthRoute` 直接从 R10 已按角色过滤的 routes 生成菜单，不在布局里重复 roles 判断；`order` 使用原索引兜底稳定排序；
- `hideInMenu` 的布局壳不产生菜单节点，但会提升其可见业务 children；root 的空 title 同时使 `route.matched` 面包屑跳过技术布局层；
- 菜单 path 来自 `router.getRoutes()` 的规范化记录，面包屑动态 path 尝试用当前 params 交给 `router.resolve`，没有手工拼接父子 path；
- 超管 `Soybean` 实测菜单为“首页、受限页”，普通账号 `User` 仅为“首页”；退出超管后再登录普通账号没有残留“受限页”，刷新后投影保持一致；
- Chrome 从 `/home` 点击到 `/restricted`，再前进/后退，`n-menu-item-content--selected` 与当前面包屑分别同步为“首页/受限页”；
- 菜单 DOM 不含 Root、Login/登录、403、404，header 面包屑只显示业务层；折叠到 64px 后选中项仍正确，浏览器控制台只有 Vite connect 日志；
- `bun install --frozen-lockfile`、`bun run typecheck`、`bun run build` 最终通过。

## 常见坑

- **菜单再过滤 roles**：与 route store 规则分叉，最后出现「路由能进但菜单没有」。
- **label 当 key**：R13 切语言后选中态丢失。
- **子路由 path 直接字符串拼接**：绝对 path、动态段与 redirect 容易被拼错。
- **将菜单存 storage**：路由与权限变更后容易读到过期投影。

## 思考题

1. 为什么菜单是路由的投影，但路由不一定是菜单的投影？
2. 面包屑用 `route.matched` 与用菜单树索引，各自会在什么场景下失真？

## 不要做

- 不要同时实现多页签，R12 单独处理缓存生命周期
- 不要做全局搜索命令盘
- 不要在 layout 组件里再维护一份 roles 列表
