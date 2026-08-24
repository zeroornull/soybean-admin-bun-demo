# 依赖对照

快照日期：2026-08-24。安装时以 npm latest 为准，TypeScript 例外。

## 运行时（应用）

| 包 | legacy | 快照 latest | 重写 | 轮次 |
| --- | --- | --- | --- | --- |
| vue | 3.5.34 | 3.5.41 | latest 3.5.x | R01 |
| vue-router | 5.0.7 | 5.2.0 | latest 5.x | R04 |
| pinia | 3.0.4 | 4.0.3 | 优先 4 | R06 |
| naive-ui | 2.44.1 | 2.45.2 | latest | R11 |
| vue-i18n | 11.4.2 | 11.4.9 | latest 11.x | R13 |
| @vueuse/core | 14.3.0 | 14.4.0 | 需要时再装 | 按需 |
| axios | 1.16.0（在 @sa/axios） | 1.19.0 | latest 1.x | R08 |
| axios-retry | 4.5.0 | — | 可选，主线不需要 | R08+ |
| dayjs | 1.11.20 | 1.11.23 | latest | R13 |
| echarts | 6.0.0 | 6.1.0 | latest 6 | R16 |
| @iconify/vue | 5.0.1 | 5.0.1 | 按需 | R15+ |
| nprogress | 0.2.0 | — | 可选 | R10 |
| clipboard | 2.0.11 | — | 需要复制按钮再装 | 按需 |
| defu | 6.1.7 | — | 深合并配置时再装 | 按需 |
| json5 | 2.2.3 | — | 解析 env JSON 时对照 `VITE_OTHER_SERVICE_BASE_URL` | 按需 |
| tailwind-merge | 3.6.0 | — | 一般可省略 | — |
| vue-draggable-plus | 0.6.1 | — | 做页签拖拽再装 | 加分 |
| @better-scroll/core | 2.5.1 | — | 可省略，overflow 代替 | — |

## 开发期

| 包 | legacy | 快照 latest | 重写 | 轮次 |
| --- | --- | --- | --- | --- |
| vite | 8.0.12 | 8.2.2 | latest 8 | R01 |
| @vitejs/plugin-vue | 6.0.6 | 6.0.8 | latest | R01 |
| @vitejs/plugin-vue-jsx | 5.1.5 | — | 用到 JSX 再装 | 按需 |
| typescript | 6.0.3 | 7.0.2 | **钉 6.x** | R01 |
| vue-tsc | 3.2.8 | 3.3.11 | latest | R01 |
| @types/node | 25.7.0 | 26.2.0 | latest | R01 |
| unocss | ^66.6.8 | 66.8.1 | latest 66 | R03 |
| unplugin-icons | 23.0.1 | — | 可选 | 加分 |
| unplugin-vue-components | 32.0.0 | — | Naive 可手动导入，按需 | 加分 |
| vite-plugin-vue-devtools | 8.1.2 | — | 可选 | 加分 |
| vite-plugin-svg-icons | 2.0.1 | — | 本地 SVG 雪碧图，可后做 | 加分 |
| vite-plugin-progress | 0.0.7 | — | 省略 | — |
| vite-plugin-vue-transition-root-validator | ^0.1.0 | — | 省略 | — |
| @elegant-router/vue | 0.3.8 | — | 主线不做 | 加分 |
| sass | 1.99.0 | — | 尽量不用 | — |
| eslint | 10.3.0 | 10.9.0 | 按需 | R18 |
| oxlint | ^1.64.0 | 1.79.0 | 建议 | R18 |
| oxfmt | ^0.49.0 | — | 建议 | R18 |
| simple-git-hooks | 2.13.1 | — | 可选 | R18 |
| vitest | — | 4.1.11 | 核心回归测试，peer 支持 Vite 8 | R19 |
| jsdom | — | 30.0.1 | DOM 测试环境 | R19 |
| @vue/test-utils | — | 2.4.11 | 至少一个关键组件测试 | R19 |
| tsx | 4.21.0 | — | 被 `bun` 跑 TS 替代 | — |
| consola / kolorist | 3.4 / 1.8 | — | CLI 才需要 | — |

## 内部包（workspace）

| 包 | legacy 是否被应用直接依赖 | 重写 |
| --- | --- | --- |
| @sa/axios | 是 | R19 锁定回归后，R20 决定是否抽，或长期留 `src/service` |
| @sa/utils | 是（经 axios/hooks） | R20 |
| @sa/hooks | 是 | 可选 |
| @sa/color | 是（登录、主题） | 可选 |
| @sa/materials | 是 | 不抽 |
| @sa/uno-preset | 是（dev） | 不抽 |
| @sa/scripts | 是（dev CLI） | 不做 |
| @sa/alova | 否（应用未作为默认） | 不做 |

## 不要装来「对齐原项目」的东西

- pnpm、`@pnpm/*`
- `npm-check-updates`（可用 `bun update`）
- `rimraf`（用 `rm -rf` 或 bun）
- `bumpp` / `@soybeanjs/changelog`（除非你要发版）
