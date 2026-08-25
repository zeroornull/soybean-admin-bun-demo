# A06 · 高级页签

R12 已经有打开/关闭/固定/KeepAlive。本轮补上拖拽排序、Chrome 外观，以及刷新后恢复页签。

## 学习目标

- 页签顺序是用户状态，固定 tab 必须始终排在可关闭 tab 前面
- Chrome 外观只是同一份 tab 数据的另一种壳，不是另一套 tab store
- 持久化必须按 **当前路由表** 过滤，登出必须清掉
- 不装 `@sa/materials`，不装 `vue-draggable-plus`（会带 Sortable）

## 对照

- `legacy/src/store/modules/tab/index.ts` 的 `cacheTabs` / `initTabStore`
- `legacy/packages/materials/src/libs/page-tab/`
- `legacy/src/layouts/modules/theme-drawer/.../tab-settings.vue`

## 边界

- 拖拽用 HTML5 DnD；固定 tab 拖完仍会收回到左侧
- 外观：`button`（R12 圆角胶囊）/ `chrome`（重叠、贴底）
- 中键关闭可关；默认开持久化
- 不做右键菜单、BetterScroll、页签图标

## 验收

- [x] 可把 Restricted 拖到 Home 右侧以外的位置；不能把 Restricted 拖到 Home 前面
- [x] 切到 chrome 外观后 `data-tab-mode="chrome"`，页签仍可点可关
- [x] 打开 Home+Restricted 后刷新，两个 tab 都在，active 仍是当前路由
- [x] 登出后再登录，不恢复上一位用户的 tab
- [x] `bun run quality` 通过
- [x] Chrome 桌面路径通过

A06 实际证据（2026-08-25）：

- 未装 `vue-draggable-plus` / `@sa/materials`；HTML5 DnD + `reorderTabs` 固定 tab 始终靠左；
- 70 tests 全绿；
- Chrome：Home+Restricted 写入 `globalTabs`，刷新后两 tab 仍在且 Restricted 为 active；抽屉切到 chrome 后 `data-tab-mode=chrome`；中键关闭 Restricted 回到 Home；登出清 storage，再登录只有 Home。

## 不要做

- 不要为同一详情页做多实例 tab id
- 不要做页签图标 / 全局搜索
- 不要拷贝 materials 的 CSS module
