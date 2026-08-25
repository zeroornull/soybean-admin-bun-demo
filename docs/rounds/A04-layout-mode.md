# A04 · 多 layout mode

主线 R05 只做了 vertical。本轮把同一份菜单树投到 6 种壳上：侧栏/顶栏谁显示一级、谁显示二级。

## 学习目标

- 布局 mode 改的是 **壳**（sider/header 是否出现、菜单放哪），不是新路由
- mix / hybrid 是菜单树的投影，不是另一份菜单数据
- 当前 views 只有一级 `home` / `restricted`，嵌套差异用测试夹具证明，不为此扩 CRUD 页
- 不引入 `@sa/materials`，不提前做 A05 主题抽屉

## 对照

- `legacy/src/layouts/base-layout/index.vue` 的 `headerProps` / `siderVisible`
- `legacy/src/layouts/modules/global-menu/context` 的 first/second/child 投影
- `legacy/src/constants/app.ts` 的 6 个 mode 名

## 6 种 mode（简化壳）

| mode | 侧栏 | 顶栏菜单 |
| --- | --- | --- |
| `vertical` | 整棵菜单，可折叠 | 无 |
| `vertical-mix` | 一级（窄栏）；有二级则再开一列 | 无 |
| `vertical-hybrid-header-first` | 仅二级（无二级则隐藏） | 一级 |
| `horizontal` | 无 | 整棵 |
| `top-hybrid-sidebar-first` | 一级 | 二级 |
| `top-hybrid-header-first` | 仅二级（无二级则隐藏） | 一级 |

## 边界

- 默认 `vertical`，写入 storage，重置主题时一起恢复
- 顶栏只放一个 mode `<select>`，完整抽屉留给 A05
- 不改 KeepAlive 契约：切 mode 只动 sider/header，content 仍在同一个 BaseLayout 里
- 不装 `@sa/materials`

## 验收

- [x] 6 个 mode 都能从 `data-layout-mode` 读到，vertical 有 sider+折叠，horizontal 无 sider 且顶栏有菜单
- [x] 同一 `menus` 夹具下，mix 的 sider 是一级、hybrid-header-first 的 header 是一级
- [x] 刷新后 mode 仍在；点重置主题回到 vertical
- [x] `bun run quality` 通过
- [x] Chrome：超管切换 vertical / horizontal / vertical-mix，菜单项仍是首页+受限页，360px 无横向撑爆

A04 实际证据（2026-08-25）：

- 未装 `@sa/materials`；`getLayoutChrome` / `pickMenus` 用嵌套夹具锁投影；
- 54 tests 全绿；
- Chrome 1280：vertical sider 220 + 折叠钮；horizontal 无 sider、顶栏水平菜单可进受限页；vertical-mix sider 90、无折叠钮；
- 刷新后仍是垂直混合；重置主题回到 vertical；
- 360px：horizontal 与 vertical（sider 64 / main 296）都无横向撑爆。

## 不要做

- 不要做圆角、水印、页脚开关（A05）
- 不要为了演示 mix 去加系统管理 CRUD
- 不要拷贝 materials 的 CSS module
