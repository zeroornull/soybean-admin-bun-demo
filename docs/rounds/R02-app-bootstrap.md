# R02 · 应用启动链

## 学习目标

- 把「插件式启动」从一道手续变成你能复述的顺序
- 理解为什么 router 要 `await isReady()` 再 mount
- 做一个最小的首屏 loading（后面主题系统会替换样式）

## 对照 legacy

精读，按顺序：

1. `legacy/src/main.ts`
2. `legacy/src/plugins/index.ts`
3. `legacy/src/plugins/loading.ts`
4. `legacy/src/plugins/assets.ts`
5. `legacy/src/App.vue`（先看结构，i18n/Naive 配置留到 R13/R14）
6. `legacy/src/store/index.ts`（本轮可以先空壳）

## 动手步骤

### 1. 拆 plugins

```text
src/plugins/
  index.ts
  assets.ts
  loading.ts
```

`assets.ts` 这一轮只引入全局 css 的占位：

```ts
import '../styles/reset.css';
```

`src/styles/reset.css` 可先从 `legacy/src/styles/css/reset.css` **抄一份并读懂**，下一轮再接到 UnoCSS。

### 2. loading

读 `legacy/src/plugins/loading.ts`：它在 `#app` mount 之前往 DOM 插一段 HTML，mount 后由应用自己卸掉。

最小实现思路：

```ts
export function setupLoading() {
  const el = document.getElementById('app');
  if (!el) return;
  el.innerHTML = `<div style="display:grid;place-items:center;height:100vh">loading</div>`;
}
```

R15 登录页交付时再决定是否做成品牌动画。

### 3. `setupApp` 异步函数

```ts
import { createApp } from 'vue';
import { setupLoading } from './plugins';
import App from './App.vue';
import './plugins/assets';

async function setupApp() {
  setupLoading();

  const app = createApp(App);

  // R06: setupStore(app)
  // R04: await setupRouter(app)
  // R13: setupI18n(app)

  app.mount('#app');
}

setupApp();
```

注释留着，提醒后续轮次插入点。插入顺序必须与 legacy 一致：store → router → i18n → mount。

### 4. App.vue

本轮仍是单页容器。可以先写：

```vue
<template>
  <div id="app-container">
    <slot />
    <!-- R04 起改为 RouterView -->
    <p>bootstrap ok</p>
  </div>
</template>
```

没有 router 时不要强行 `RouterView`。

## 验收

- [x] `setupLoading()` 在隔离 DOM 中实际注入 `data-app-loading` 与可见 loading 文案，且缺少 `#app` 时安全 no-op
- [x] 真实 headless Chrome 中 mount 后 loading 标记消失，被 `#app-container` 与 `bootstrap ok` 替换
- [x] 能讲出：store 必须在 router 之前 `app.use`，因为 router 初始导航/守卫可能在 mount 前就调用 store，尚未注册 Pinia 时会缺少活动实例

R02 实际证据（2026-08-24）：

- `src/plugins/assets.ts`、`index.ts`、`loading.ts` 与 `src/styles/reset.css` 已建立，reset 与 legacy 原文逐字一致；
- `main.ts` 已改为异步 `setupApp()`，启动顺序为 assets → loading → createApp → mount，并留出 store → router → i18n 插入点；
- `bun install --frozen-lockfile`、`bun run typecheck`、`bun run build` 均通过，构建转换 15 个模块；
- R02 初验时，9528–9553 位于 Windows excluded range，9554 又有另一个 `bun dev`，因此临时使用 9555；D14 后已在 strict `19528` 重新验证根 HTML、main、loading、assets、reset、App 和 favicon 全部 HTTP 200；
- headless Chrome DOM 实际包含 `#app-container` / `bootstrap ok`，不再包含 `data-app-loading`；
- 未引入 Router、Pinia、i18n、Naive UI 或 Elegant Router，开发服务验证后已停止。

## 常见坑

- **在 `setupLoading` 之后立刻 `innerHTML = ''`**：没意义。loading 的终点是 Vue mount。
- **同步 top-level `app.mount` 却在后面 `await router.isReady()`**：legacy 是先 wait 再 mount。动态路由场景下顺序反了会闪 404。

## 思考题

1. 若 pinia 在 router 之后注册，守卫里 `useAuthStore()` 会怎样？
2. `createApp` 可以调用多次吗？热更新时要注意什么？

## 不要做

- 不要现在接入 Naive `NConfigProvider`（R13/R14 再同时对齐 locale 与 theme）
- 不要拷贝 `vite-plugin-vue-transition-root-validator`，那是原项目的校验插件，非内核
