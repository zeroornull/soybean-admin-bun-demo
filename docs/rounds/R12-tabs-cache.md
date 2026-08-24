# R12 · 多页签、页面缓存与重载

## 学习目标

- 为多页签建立明确的标识、打开、关闭、固定和邻页回退规则
- 让 tab store 与 Vue `KeepAlive` 缓存名单保持一致
- 实现「重载当前页」而不刷新整个浏览器
- 理解 route name、fullPath 与组件 name 分别服务于哪个边界

## 对照 legacy

- `legacy/src/layouts/modules/global-tab/index.vue`
- `legacy/src/store/modules/tab/index.ts`
- `legacy/src/store/modules/tab/shared.ts`
- `legacy/src/layouts/modules/global-content/index.vue`
- `legacy/packages/materials/src/libs/page-tab/`
- `legacy/src/store/modules/app/index.ts` 的 reload 状态

## 动手步骤

### 1. 先定义 Tab 模型

最小字段：`id`、`labelKey/label`、`routeName`、`fullPath`、`pinned`、`keepAlive`。

主线可用 route name 作唯一 id；一旦需要「同一详情页打开多个 id」，再升级为 name + params/query，不提前设计无限泛化标识器。

### 2. 完成 tab store 最小 API

- `addTab(route)`
- `removeTab(id)`
- `removeOthers(id)`
- `removeAll()`（保留 pinned）
- `setActiveTab(id)`
- `clearTabs()`（登出用）
- `cacheNames` computed

固定 home tab 不可被普通关闭。关闭当前 tab 时，优先去左邻，无左邻再去右邻，都没有则回 home。

### 3. 在导航完成后添加 tab

可在 `afterEach` 或 content 中 watch route。constant、hideInMenu 或明确禁止 tab 的页面不入列表。

浏览器前进/后退同样要更新 active tab，不能只监听菜单点击。

### 4. 对齐 KeepAlive

```vue
<KeepAlive :include="tabStore.cacheNames">
  <component :is="Component" />
</KeepAlive>
```

`include` 匹配的是 Vue 组件 `name`，不是 URL。需缓存的页面使用 `defineOptions({ name: 'Home' })`，并建立可被测试的 route name ↔ component name 映射规则。

关闭 tab 时要同时从 `cacheNames` 移除，否则组件实例仍可能留在内存中。

### 5. 实现局部重载

对照 legacy 的 app-store reload flag：先让 `RouterView` 容器在一个 tick 内卸载，再挂载。不要依赖随机 key 无限创建旧实例。

### 6. 决定是否持久化

主线不强制持久化 tabs。若不持久化，刷新后至少根据当前 route 重建当前 tab 和固定 home。若持久化，还必须在路由/权限变更后丢弃已失效 tab。

## 验收

- [x] 菜单导航、程序跳转、浏览器前进/后退都会对齐 active tab
- [x] 关闭当前 tab 会按确定规则跳转，不停留在已删 tab 的 URL
- [x] home 固定 tab 不可被普通关闭
- [x] 关闭可缓存 tab 后，对应组件从 KeepAlive 名单移除
- [x] 重载按钮会重跑当前页的 mounted，不刷新整个浏览器
- [x] 登出后不保留上个用户的 tabs / cache
- [x] `bun run typecheck` 通过

R12 实际证据（2026-08-24）：

- Tab 使用 route name 作为 `id`，记录 `label/labelKey/routeName/fullPath/pinned/keepAlive/componentName`；同名 route 的 query/params 导航更新原 tab 的 `fullPath`，不提前引入多实例 id；
- `router.afterEach` 同时同步 route 与 tab store，菜单点击、Restricted 页内 `RouterLink`、tab 点击、浏览器 Back/Forward 均实测 active tab 与 URL 一致；
- Home 由 route meta 声明 `pinned + keepAlive + componentName=Home`，刷新 `/restricted` 后只重建固定 Home 与当前 Restricted，不向 storage 持久化旧 tabs；
- Home/Restricted 都提供局部计数状态：Home 从 0 加到 2，切换到 Restricted 再返回仍为 2，证明 `KeepAlive include=[Home,Restricted]` 生效；
- Restricted 计数为 1 时点击局部重载后回到 0，同时预先写入的 `window.__r12DocumentMarker` 仍为 `same-document`，证明没有刷新浏览器文档；重载结束后缓存名单恢复为 `Home,Restricted`；
- Restricted 计数加到 2 后关闭 active tab，URL 按左邻规则回到 `/home`，缓存名单变成 `Home`；重新从菜单打开 Restricted 时计数为 0，证明关闭同时销毁缓存实例；
- Home tab 没有普通关闭按钮；Close Others 和 Close All 都实测只保留 Home，关闭 active Restricted 时自动导航 Home；
- 超管登出时 tabs/cache 清空；登录普通账号并打开 Home 后只重建固定 Home，未残留 Restricted；login/403 不进入 tab；
- 360×800 Chrome 下 tab 横向区域、固定 Home 与 reload 按钮无溢出；控制台无 Vue/Router/KeepAlive 错误；最终 frozen install、typecheck、build 与 diff check 通过。

## 常见坑

- **route name 与 component name 混为一谈**：KeepAlive 只看组件 name。
- **只删 UI tab，不删 cache**：页面状态幽灵般保留。
- **关闭当前 tab 后才读邻居**：索引已变，跳错页。先计算下一个目标。
- **持久化所有 tab**：旧权限、旧 query 和已删路由会残留。

## 思考题

1. 为什么「页签唯一性」和「组件缓存唯一性」可能不是同一个 key？
2. 同一详情页允许多个 params tab 时，KeepAlive 应缓存一个组件类型还是多个实例？

## 不要做

- 不要复制 Chrome 风格 SVG 与拖拽交互
- 不要为了重载当前页调 `window.location.reload()`
- 不要把 login / 403 / 404 / 500 放入业务 tab
