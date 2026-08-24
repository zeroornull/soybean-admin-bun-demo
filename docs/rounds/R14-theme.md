# R14 · 暗黑、主题色与 Naive 主题同步

## 学习目标

- 让暗黑模式同时驱动 `html.dark`、CSS 变量和 Naive UI `darkTheme`
- 用 theme store 管理主题 scheme、主题色和持久化
- 从一个主色生成最小可用的 Naive hover / pressed / suppl overrides
- 处理系统主题、用户选择与首屏闪烁的优先级

## 对照 legacy

- `legacy/src/App.vue`
- `legacy/src/store/modules/theme/index.ts`
- `legacy/src/store/modules/theme/shared.ts`
- `legacy/src/theme/settings.ts`
- `legacy/src/theme/vars.ts`
- `legacy/packages/color/`
- `legacy/src/components/common/theme-schema-switch.vue`

## 动手步骤

### 1. 完成 theme store 的主线字段

- `themeScheme: 'light' | 'dark' | 'auto'`
- `darkMode: computed<boolean>`
- `themeColor: string`
- `naiveTheme: computed`
- `themeOverrides: computed`
- `setThemeScheme()` / `setThemeColor()` / `resetTheme()`

若为了降低难度先只做 light/dark，可通过主线；`auto` 作为本轮建议项，需监听 `prefers-color-scheme`。

### 2. 同步 DOM 与 color-scheme

theme store 中统一执行：

```ts
document.documentElement.classList.toggle('dark', darkMode);
document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
```

不要在每个页面或按钮里自己切 class。

### 3. 对齐 App.vue 的 Naive 主题

`NConfigProvider` 同时接收：

- R13 的 locale / date-locale；
- 本轮的 `theme`；
- 本轮的 `theme-overrides`。

保证 Naive 组件、布局背景与 UnoCSS 原子类所消费的 CSS 变量使用同一个 darkMode 源。

### 4. 展开主题色

主线至少生成 `primaryColor`、`primaryColorHover`、`primaryColorPressed`、`primaryColorSuppl`。

先可以用小型颜色工具函数完成，R19 锁定输入/输出后，R20 再决定是否抽 `@sa/color`。不要把 legacy 的全套 palette 在没有实际消费者时全搬进来。

### 5. 持久化并避免首屏闪烁

在 Vue mount 前从 storage 读取 theme scheme，并尽早对 `<html>` 应用 dark class。如支持 auto，用户显式选择优先于系统媒体查询。

### 6. header 控件

提供主题模式快捷开关和最小主色选择。完整 theme drawer、圆角、水印、六种布局仍为加分项。

## 验收

- [x] 切暗黑时 `html.dark`、布局 CSS 变量和 Naive UI 同时切换
- [x] 表单、菜单、面包屑、页签、弹层与页面背景在暗黑下无明显白块
- [x] 修改主题色后，Naive 主按钮的 default / hover / pressed 都有合理反馈
- [x] 刷新后保持主题选择，首屏不先亮后暗或先暗后亮
- [x] reset theme 会同时清理 storage 与 DOM 状态
- [x] R13 的语言切换在 `NConfigProvider` 改造后仍正常
- [x] `bun run typecheck` 通过

R14 实际证据（2026-08-24）：

- theme store 实现 `light/dark/auto`、system media、darkMode、themeColor、Naive darkTheme/overrides、DOM/storage watch 与 reset；在 `setupStore` 阶段初始化，早于 router/i18n/mount；
- `index.html` head 使用 `%VITE_STORAGE_PREFIX%` 预应用合法 scheme；生产构建确认替换成 `SOY_themeScheme`。dark 冷启动的首个 Home heading 快照已是 dark class，body 背景从暗色 rgba 收敛到 `rgb(17,24,39)`，未出现亮背景帧；
- 显式 dark 实测 `html.dark=true`、`style.colorScheme=dark`、layout/card 分别为 `#111827/#1f2937`，Naive 全局文本与 NDatePicker 弹层为暗色；弹层背景 `rgb(72,72,78)`，无白块；
- 主色改为 `#e11d48` 后，CSS/storage 与 Naive NButton vars 同步为 default `#e11d48`、hover `#e64165`、pressed `#b9183b`、suppl `#e32f57`，菜单 active 同为主色；
- `auto` 在系统 light 下 `dark=false`，DevTools emulation 切 dark 后立即 `dark=true`，再切 light 恢复；storage 始终保留 `auto`。系统 light 时显式 dark 仍保持暗色，证明用户选择优先；
- reset 从 dark + 自定义红色恢复 light + `#646cff`，DOM/Naive palette 同步，`SOY_themeScheme/SOY_themeColor` 均为 null，R13 的 `SOY_locale=en-US` 不受影响；
- storage 写入 `sepia/not-a-color` 后刷新，回退并修正为 `light/#646cff`；纯函数校验默认 palette、大小写规范化、短 hex 拒绝与 fallback 全通过；
- R13 语言切换在 dark/custom/provider 下仍同步页面、tabs、dayjs 与 DatePicker；DatePicker 关闭再打开后内置日历从中文切换为英文；
- 360×800 下 header 仅保留 scheme 快捷键，颜色/reset 自动隐藏，locale/logout/tabs/content 无横向溢出；最终 frozen install/typecheck/build/diff check 无 warning 通过。

## 常见坑

- **只切 `html.dark`**：Naive 组件仍用亮色 theme。
- **只切 Naive theme**：布局自己的 CSS 变量仍是亮色。
- **主色只改 default**：hover/pressed 仍是旧色，交互不连续。
- **mount 后才应用 storage 主题**：产生可见闪烁。

## 思考题

1. `themeScheme='auto'` 时，store 应持久化 `auto` 还是当时计算出的 `darkMode`？
2. 主题色展开是通用纯函数还是应用业务？这如何影响 R19 的测试边界与 R20 的抽包决策？

## 不要做

- 不要一次搬入全部 theme preset JSON
- 不要同时实现圆角、水印、六种 layout mode 和完整主题抽屉
- 不要让页面组件直接改 `<html>` class
