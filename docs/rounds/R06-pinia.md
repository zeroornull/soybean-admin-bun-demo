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

- [x] 点击折叠后 app-store 变为 true，侧栏 220→64px；进入 Login 卸载 BaseLayout 后状态仍保留，返回 Home 仍是 64px
- [x] 真实 Chrome 中 `pinia.state.value` 先出现 `app-store`，实例化五个 store 后包含 app/auth/theme/route/tab 全部 store ID
- [x] 浏览器控制边界动态 import `useAppStore()` 并调用 `$reset()` 后，state 恢复 false，UI 同步回到 220px
- [x] `app.ts`、`auth.ts`、`theme.ts`、`route.ts`、`tab.ts` 五个 setup store 都已建立，仅 app 有本轮所需 action，其余只定义状态与后续职责

R06 实际证据（2026-08-24）：

- 安装 Pinia `4.0.3` 与 peer `@vue/devtools-api 8.2.1`，当前 Vue 3.5.41 / TypeScript 6.0.3 满足 peer 约束；
- `src/store/ids.ts` 定义 `app-store/auth-store/theme-store/route-store/tab-store`，reset 插件只对这五个 ID 生效；
- `resetSetupStore` 在 store 创建时 JSON clone 初始 `$state`，每次 `$reset()` 再 clone 并 `$patch`，避免默认数组/对象被后续修改；
- `main.ts` 启动顺序已变为 `createApp → setupStore → await setupRouter → mount`；BaseLayout 不再有本地 collapse ref，只消费 `useAppStore()`；
- Chrome 实测跨路由保留 app-store：Home 折叠 64px → Login 仍 true → Home 仍 64px；
- 五 store 实测修改 token/user/themeColor/menus/tabs 等状态后逐一 `$reset()`，恢复 `false/''/null/#646cff/[]/[]`；menus/tabs 二次修改再 reset 仍恢复空数组；
- 生产构建转换 55 个模块，`bun install --frozen-lockfile`、`bun run typecheck`、`bun run build` 均通过；
- 本轮未做 localStorage 持久化，未写登录/API/路由/tab/theme 未来 action，未使用 `throw new Error('Rxx')` 占位。

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
