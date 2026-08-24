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

- [ ] home 有顶栏、侧栏、内容区
- [ ] 侧栏可折叠，内容区宽度跟着变
- [ ] login 全屏，无侧栏
- [ ] 缩小浏览器到手机宽度时，侧栏不要撑爆（可以先 `overflow-auto`，R15–R17 页面交付时再完整回归）

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
