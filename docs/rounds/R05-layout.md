# R05 · 布局骨架

## 学习目标

- 把后台「壳」拆成 header / sider / content，而不是一个巨大的 App.vue
- 理解 layout 组件只负责结构，**菜单数据来自路由/store，不来自布局自己 hardcode 一整棵业务树**
- 先做 vertical 一种模式

## 对照 legacy

- `legacy/packages/materials/src/libs/admin-layout/` — 真正的网格/flex 布局实现
- `legacy/src/layouts/base-layout/index.vue` — 如何把材料组件和全局模块拼起来
- `legacy/src/layouts/modules/global-header/index.vue`
- `legacy/src/layouts/modules/global-sider/index.vue`
- `legacy/src/layouts/modules/global-content/index.vue`

本轮 **不要** 拷贝 materials 的全部 CSS。读懂结构后自己用 UnoCSS 写一个简化版。

## 动手步骤

### 1. 结构

```text
src/layouts/
  base-layout.vue
  blank-layout.vue
  modules/
    header.vue
    sider.vue
    content.vue
```

### 2. 简化 AdminLayout

目标 DOM：

```text
+--------+------------------+
| logo   | header           |
| nav    | content          |
| nav    | footer(optional) |
+--------+------------------+
```

侧栏宽 220px，折叠后 64px。折叠状态先用 `ref` 放 layout 内部，R06 再升到 app store。

### 3. sider 先写死两个入口

```ts
const items = [
  { to: '/home', label: '首页' },
  { to: '/login', label: '登录（稍后会被守卫拦住已登录用户）' }
];
```

R11 再改为「由权限路由生成菜单」。现在写死是为了验证 `RouterLink` 与 `RouterView` 嵌套。

### 4. content

```vue
<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>
```

R12 再引入 `KeepAlive` 并与 tab store 的 cache 对齐。现在不做无条件缓存，避免将 login/404 等页面意外留在内存中。

### 5. login 继续走 blank-layout

用路由 `component` 区分，不要在 base-layout 里 `v-if="route.name === 'login'"`。

## 验收

- [x] Home 同时渲染 `data-layout-header`、`data-layout-sider`、`data-layout-content`，内容页只在 Content 的 RouterView 中出现
- [x] 侧栏展开 220px、折叠 64px，780px 视口下主区宽度从 560px 跟随变为 716px
- [x] 从侧栏进入 Login 后只有 blank layout，header/sider/content 全部不渲染
- [x] Chrome 切到 360×800 后，侧栏宽 64px、主区 296px，document/body scrollWidth 都为 360，无横向溢出

R05 实际证据（2026-08-24）：

- 新增 `src/layouts/modules/header.vue`、`sider.vue`、`content.vue`，BaseLayout 只保留本地 `siderCollapsed` ref 和三模块组装；
- Header 高 56px，只负责折叠事件与当前 route title；Sider 只硬编码 Home/Login 两个 RouterLink；Content 只有普通 RouterView/component；
- Chrome 桌面实测：展开 `sider=220/main=560`，点 toggle 后 `sider=64/main=716`，Header 始终 56px，Content `overflow-y:auto`；
- 从折叠侧栏点 Login 后 base 三模块全部卸载，只渲染 blank/login；返回 Home 后布局本地 ref 按预期重建为展开态；
- Chrome 360px 实测无横向溢出，移动媒体类将侧栏约束为 64px，菜单/品牌文案隐藏；
- 生产构建转换 46 个模块，生成约 6.81 kB CSS，已检出 220/64px width、56px height、overflow-auto、min-width:0 规则；
- `bun install --frozen-lockfile`、`bun run typecheck`、`bun run build` 均通过，未引入 KeepAlive、`@sa/materials`、theme drawer、global search 或 Pinia。

## 常见坑

- **把 `RouterView` 放在 header 里**：页面会渲染到错误区域。
- **布局里直接 import 所有业务页**：失去懒加载。
- **复制 materials 的 CSS module 却不生成 `.d.ts`**：TS 会报。自己用 Uno 类名更简单。

## 思考题

1. `KeepAlive` 的 key 应该用 `route.fullPath` 还是 `route.name`？多标签场景有什么差别？
2. mix 布局（一级菜单在侧栏、二级在顶栏）本质上只是「同一份菜单树的两种投影」。怎么证明？

## 不要做

- 不要做 6 种 layout mode
- 不要做 theme drawer
- 不要做全局搜索面板
