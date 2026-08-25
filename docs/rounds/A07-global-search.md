# A07 · 全局搜索（命令盘）

菜单和页签已经能导航。本轮加一个命令盘：按标题/路径过滤 **当前用户可见的菜单**，回车跳转。

## 学习目标

- 搜索源是路由投影后的菜单叶子，不是全部 `vue-router` 记录
- 无权限的页（普通用户的 Restricted）不能被搜到
- 空关键字列出全部可搜项（命令盘）；输入后做包含匹配
- 快捷键自己绑，不装 `@vueuse/core`

## 对照

- `legacy/src/layouts/modules/global-search/`
- `legacy/src/store/modules/route/shared.ts` 的 `transformMenuToSearchMenus`

## 边界

- 数据：`routeStore.menus` 展平叶子 + 两条命令（打开主题抽屉、切换亮暗）
- 打开：顶栏按钮、`Ctrl/⌘+K`
- 操作：↑↓ 选择，Enter 执行，Esc 关闭
- 不做文件内容搜索、fuse 模糊、远程 API

## 验收

- [x] 超管能搜到首页和受限页；普通用户搜「受限」无结果
- [x] Enter 跳到选中路由；Esc 关闭
- [x] `Ctrl+K` 打开；抽屉可关掉搜索按钮
- [x] `bun run quality` 通过
- [x] Chrome：超管搜「受限」回车进入 `/restricted`

A07 实际证据（2026-08-25）：

- 搜索源是菜单叶子 + 两条命令；未装 `@vueuse/core` / fuse；
- 75 tests 全绿；
- Chrome：超管打开搜索可见首页/受限页，点受限页到 `/restricted`；User 打开搜索无受限页，输入「受限」为空结果。

## 不要做

- 不要搜 403/404/login
- 不要为搜索加新业务页
- 不要装 fuse.js / `@vueuse/core`
