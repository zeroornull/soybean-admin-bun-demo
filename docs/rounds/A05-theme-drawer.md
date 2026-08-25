# A05 · 完整主题设置抽屉

R14 只做了 scheme / 主色 / 重置。本轮把剩余外观收进一个 Naive 抽屉：圆角、水印、预设、区块开关。

## 学习目标

- 主题设置是一份 **可持久化的配置**，抽屉只是编辑器
- 圆角同时驱动 CSS 变量和 Naive `borderRadius`
- 水印是全局叠加，不进路由
- 预设是一次写入多字段，不是另一套主题系统
- 区块开关只隐藏壳上的块（页签 / 面包屑 / 页脚），不卸载会话状态

## 对照

- `legacy/src/layouts/modules/theme-drawer/`
- `legacy/src/theme/settings.ts`
- `legacy/src/App.vue` 的 `NWatermark`
- `legacy/src/store/modules/theme/shared.ts` 的 radius / grayscale

## 边界

- 抽屉四个页：外观 / 布局 / 通用 / 预设
- 不拷贝 clipboard 导出、页签 Chrome 外观（A06）、全局搜索开关（A07）
- 不引入 `@vueuse/core`；水印时间用 `dayjs` + `setInterval`
- 预设写在 TS 里，不扫 JSON glob
- 顶栏 A04 的 layout `<select>` 保留，抽屉里再放一份

## 验收

- [x] 顶栏可打开抽屉；360px 宽度不超过视口
- [x] 圆角 0–16 写入 `--theme-radius` 和 Naive overrides
- [x] 水印可开；用户名 / 时间互斥；自定义文本
- [x] 可关页签、面包屑，可开页脚
- [x] 应用预设会改色/布局/圆角；重置主题全部回到默认
- [x] 刷新后抽屉设置仍在
- [x] `bun run quality` 通过

A05 实际证据（2026-08-25）：

- Naive `NDrawer` 四页：外观 / 布局 / 通用 / 预设；未装 `@vueuse/core` / `defu`；
- 61 tests 全绿；
- Chrome：圆角 6→12 写入 `--theme-radius`；关页签开页脚；开水印；紧凑预设 → horizontal + `#18a058` + radius 2；刷新仍在；重置回到 vertical / `#646cff` / radius 6；
- 360px 抽屉宽 324，无横向撑爆。

## 不要做

- 不要做页签拖拽或 Chrome 风格页签
- 不要为预设去装 `defu` 或搬全套 tokens
- 不要把页脚做成独立业务模块
