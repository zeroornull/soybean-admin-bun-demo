# R04 · 路由基础（手写 vue-router 5）

## 学习目标

- 会创建 history / hash 路由
- 分清 **布局路由** 和 **页面路由** 的父子关系
- 先做「能跳」，权限留在 R10

## 对照 legacy

- `legacy/src/router/index.ts` — history 模式映射
- `legacy/src/router/routes/builtin.ts` — 内置路由
- `legacy/src/layouts/blank-layout/index.vue`
- `legacy/src/layouts/base-layout/index.vue`（本轮可用占位组件）
- **不要**把 `legacy/src/router/elegant/` 当手写范本

## 动手步骤

### 1. 安装

```bash
bun add vue-router
```

### 2. 两种 layout 占位

```vue
<!-- src/layouts/blank-layout.vue -->
<template>
  <RouterView />
</template>
```

```vue
<!-- src/layouts/base-layout.vue -->
<template>
  <div class="h-full flex">
    <aside class="w-220px">sider</aside>
    <main class="flex-1">
      <RouterView />
    </main>
  </div>
</template>
```

R05 再换成真布局。

### 3. 路由表

```ts
// src/router/routes.ts
import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    redirect: '/home',
    component: () => import('@/layouts/base-layout.vue'),
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/layouts/blank-layout.vue'),
    children: [
      {
        path: '',
        name: 'login-page',
        component: () => import('@/views/login/index.vue'),
        meta: { constant: true, title: '登录' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/_builtin/404.vue'),
    meta: { constant: true }
  }
];
```

`meta.constant` 与 `meta.requiresAuth` 的语义先对齐 legacy：constant = 未登录也可访问。

### 4. 创建 router

对照 `legacy/src/router/index.ts`：

```ts
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import { routes } from './routes';

const history =
  import.meta.env.VITE_ROUTER_HISTORY_MODE === 'hash'
    ? createWebHashHistory(import.meta.env.VITE_BASE_URL)
    : createWebHistory(import.meta.env.VITE_BASE_URL);

export const router = createRouter({
  history,
  routes
});

export async function setupRouter(app: App) {
  app.use(router);
  await router.isReady();
}
```

在 `main.ts` 的 mount 之前 `await setupRouter(app)`。`App.vue` 改为 `<RouterView />`。

### 5. 最小页面

`views/login`、`views/home`、`views/_builtin/404` 各一个标题 + 一个 `RouterLink`。

## 验收

- [ ] `/login` 不带侧栏（blank）
- [ ] `/home` 带侧栏占位（base）
- [ ] 访问 `/this-does-not-exist` 看到 404
- [ ] 改 `VITE_ROUTER_HISTORY_MODE=hash` 后 URL 带 `#`

## 常见坑

- **404 写在 `/` 的 children 里**：匹配行为会和「全局兜底」不同。先做全局兜底，R10 再学 legacy 那种「先抓 not-found 再重定向」的初始化技巧。
- **`RouterView` 既放 App 又忘了放 layout**：子路由不会渲染。
- **name 重复**：`login` 与 `login-page` 不要撞名。

## 思考题

1. `redirect: '/home'` 和 `redirect: { name: 'home' }` 哪个更稳？为什么？
2. 为什么 `setupRouter` 是 async 的？`isReady()` 在懒加载组件时等待的是什么？

## 不要做

- 不要写 `beforeEach` 鉴权（R10）
- 不要接 Elegant Router
- 不要动态 `addRoute`
