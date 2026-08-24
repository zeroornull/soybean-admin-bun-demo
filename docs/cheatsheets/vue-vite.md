# Vue / Vite 要点（重写时会踩）

## Vue 3.5

- 默认 Composition API + `<script setup lang="ts">`
- 组件 `name` 用 `defineOptions({ name: 'Home' })`，KeepAlive 依赖它
- `defineModel` 可以简化 v-model 组件
- 不要学 Vue 2 的 `this.$xxx` 选项式，除非读老代码

## Vue Router 5

- `beforeEach` 可以返回 `false` / `RouteLocationRaw` / 什么都不返回（放行）
- 动态加的路由要保存 `addRoute` 的返回值以便登出移除
- `router.isReady()` 应在第一次渲染前 await，减少闪 404

## Pinia 4

- ESM-only
- 继续用 setup store
- 自己补 `$reset`
- 循环依赖：只在 action 函数体内 `useXxxStore()`

## Vite 8

- `loadEnv(mode, cwd)` 读 `.env.[mode]`
- 只有 `VITE_` 前缀会进客户端
- `base` 要和 router history 的 base 一致
- 插件顺序：`vue()` 通常靠前，UnoCSS 紧随其后

## Naive UI

- 必须有 `NConfigProvider` 才能统一 locale / theme
- 暗黑：传 `darkTheme`，不是自己改每个组件 color
- 全局 `message` / `dialog` 需要 provider（legacy 的 `AppProvider`）

## UnoCSS

- 忘了 `import 'virtual:uno.css'` 等于没装
- `dark: 'class'` 对应 `html.dark`
- 主题色走 CSS 变量，再在 `theme.colors` 里引用
