# R06 · Pinia 状态

## 学习目标

- 用 **setup 语法** 写 store（legacy 全是这种）
- 给 setup store 补 `$reset`（登出要用）
- 分清五个 store 的职责，即使这一轮只实现 app + 空壳

## 对照 legacy

- `legacy/src/store/index.ts`
- `legacy/src/store/plugins/index.ts` — `$reset` 的实现
- `legacy/src/enum/index.ts`
- `legacy/src/store/modules/app/index.ts`
- `legacy/src/store/modules/auth/index.ts`（读职责，登录逻辑 R09 再写）
- `legacy/src/store/modules/theme/index.ts`（读 state 形状）
- `legacy/src/store/modules/route/index.ts`（读 constant/auth 两段初始化）
- `legacy/src/store/modules/tab/index.ts`

## 动手步骤

### 1. 安装

```bash
bun add pinia
```

优先 Pinia 4。若安装时提示缺少 `@vue/devtools-api`：

```bash
bun add @vue/devtools-api
```

### 2. 注册

```ts
import { createPinia } from 'pinia';
import { resetSetupStore } from './plugins/reset';

export function setupStore(app: App) {
  const pinia = createPinia();
  pinia.use(resetSetupStore);
  app.use(pinia);
}
```

插在 `setupRouter` 之前。

### 3. 复制 `$reset` 思路

setup store 的 `$state` 在定义后立刻 `jsonClone` 一份作为默认值，然后：

```ts
context.store.$reset = () => {
  context.store.$patch(defaultStore);
};
```

只对你列出的 id 生效，避免误伤第三方 store。

深度克隆：先用 `JSON.parse(JSON.stringify(x))` 顶上，R20 抽 utils 时再评估是否需要替换。

### 4. 本轮要实现的

**必须：**

- `useAppStore`：`siderCollapse: boolean`、`toggleSider()`，布局侧栏改读这个
- store id 常量（对标 `SetupStoreId`）

**空壳（只定义当前能确定的 state 与职责注释，不写伪 action）：**

- `useAuthStore`：`token`、`userInfo`
- `useThemeStore`：`darkMode`、`themeColor`
- `useRouteStore`：`menus`（空数组）
- `useTabStore`：`tabs`（空数组）

空壳的意义是：后面轮次往里面填，而不是改名改职责。
不要用 `throw new Error('Rxx')` 或空函数占位；这些方法会在没有契约时被其他模块误用。

### 5. 可选持久化

把 `siderCollapse` 写入 `localStorage`。自己写 10 行即可，不必上 pinia-plugin-persistedstate。legacy 对 token 用的是自封装 `localStg`（`legacy/src/utils/storage.ts` + `@sa/utils`）。

## 验收

- [ ] 点击折叠，侧栏变化
- [ ] 在 Vue DevTools 里能看到 app-store
- [ ] 在控制台 `useAppStore().$reset()` 后折叠恢复默认（需在组件外先拿到 pinia 实例，或临时做个按钮）
- [ ] 五个 store 文件都在，职责注释写清

## 常见坑

- **在 `defineStore` 回调里立刻 `useRoute()` 但 router 未就绪**：auth store 会踩这个。R09 写登录时把 `useRoute` 放到 action 内，或保证 setupRouter 在首次调用 action 之前完成。
- **store 互相 import 形成循环**：legacy 的 auth → route → tab → auth 有环。用「延迟调用」（在函数体内 `useXxxStore()`）而不是模块顶层取 store。
- **Pinia 4 ESM-only**：不要用 `require('pinia')`。

## 思考题

1. 为什么 setup store 没有免费的 `$reset`？options store 为什么有？
2. 把 token 只放 Pinia 不放 localStorage，刷新页面会发生什么？只放 storage 不放 Pinia 呢？

## 不要做

- 不要在这一轮写登录 API
- 不要上 Vuex
- 不要把所有 UI 状态都塞进 app-store（主题归 theme，页签归 tab）
