# A10 · 图标雪碧图、组件自动导入与版本更新

本轮补三个加分插件行为：本地 SVG 雪碧图、`src/components` 自动导入、生产构建号变化时的刷新提示。不装官方 `vite-plugin-svg-icons` / `unplugin-vue-components`。

## 学习目标

- 本地 SVG 打成 symbol 雪碧图，页面用 `<use href="#id">`，不是每个图标一份内联文件
- 自动导入是 **编译期注入 import**，不是运行时 `app.component`
- 版本提示比较当前 `BUILD_TIME` 和最新 `index.html` 的 `buildTime` meta，不是轮询业务 API
- Naive 组件仍显式导入，避免一次改光所有页面

## 对照

- `legacy/build/plugins/unplugin.ts` 的 `createSvgIconsPlugin` / `unplugin-vue-components`
- `legacy/src/components/custom/svg-icon.vue`
- `legacy/src/plugins/app.ts` 的 `setupAppVersionNotification`
- `legacy/build/plugins/html.ts`

## 边界

- 雪碧图前缀 `icon-local-*`，图标放 `src/assets/svg-icon/`
- 自动导入只覆盖 `src/components` 里的 `SvgIcon` / `LocaleSwitch` / `ThemeControls` / `ExceptionBase`
- 不装 Iconify；菜单/搜索用本地 SVG
- 生产且 `VITE_AUTOMATICALLY_DETECT_UPDATE=Y` 才轮询；首页有「模拟发现新版本」供开发验收
- 不改守卫，不加业务 CRUD

## 验收

- [x] 菜单图标是 SVG `<use>`，不是 Unicode 字符
- [x] `src/views/login` 等页面不再手写 `LocaleSwitch` / `ThemeControls` import，页面仍能渲染
- [x] `index.html` 含 `buildTime` meta
- [x] 模拟新版本出现提示；稍后关闭；刷新会 reload
- [x] 非法/相同 buildTime 不提示（单测）
- [x] `bun run quality` 通过
- [x] Chrome：菜单可见 SVG；点模拟更新出现横幅

A10 实际证据（2026-08-25）：

- 未装 `vite-plugin-svg-icons` / `unplugin-vue-components` / `@iconify/vue`；本地插件注入雪碧图与 `src/components` import；
- 91 tests 全绿；`bun run quality` + `bun run build` 通过；产物 `index.html` 含 `buildTime` meta；
- Chrome：`#__SVG_ICON_LOCAL__` 有 7 个 symbol；菜单 `use` 指向 `#icon-local-home/link/lock`，搜索为 `#icon-local-search`；登录页未手写 LocaleSwitch import 仍能切语言/主题；点「模拟发现新版本」出现横幅，「稍后」关闭。

## 不要做

- 不要安装 `vite-plugin-svg-icons`、`unplugin-vue-components`、`@iconify/vue`
- 不要给 Naive 做全局自动导入
- 不要接真实 CDN 图标服务
