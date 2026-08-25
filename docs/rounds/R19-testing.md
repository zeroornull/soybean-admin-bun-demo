# R19 · 自动化回归测试

## 学习目标

- 用 Vitest 为重写中最易回归的纯逻辑与 store action 建立安全网
- 学会选择「值得测的契约」，而不是为覆盖率复制实现细节
- 隔离 storage、router、HTTP 和时间等外部边界，让失败可定位
- 将测试命令接入本地 quality 脚本与 CI

## 为什么必须有独立一轮

原 16 轮路线只有浏览器手动勾选，没有任何自动化回归。权限过滤、登出清理、tab 邻页选择和 request 错误分类都是「截图看不出，但改一行就会坏」的逻辑，需要可重复证据。

## 对照 legacy

legacy 本身不是测试范本。本轮从你自己已建立的契约反推测试：

- R08 `FlatResult` / `RequestError`
- R09 auth reset 与 session restore
- R10 roles 过滤与守卫决策树
- R11 route → menu 投影
- R12 tab 关闭与 cacheNames
- R13 locale key 一致性

## 动手步骤

### 1. 安装最小测试工具

```bash
bun add -d vitest jsdom @vue/test-utils
```

如本轮只测纯函数与 store，`@vue/test-utils` 可暂缓；不要为了「看起来完整」一次引入 Vitest、Playwright、Cypress 三套。

`package.json` 加：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 2. 配置与 Vite 一致的 alias

测试不应在另一份配置中手写不同的 `@` 别名。复用 Vite config 或确保同一个 alias 工厂被两边消费。

只有需要 DOM 的测试使用 jsdom；纯函数保持 node 环境，减少隐式全局。

### 3. 必须覆盖的回归契约

至少写以下用例：

1. **request**：成功码、业务失败码、网络错误分别归一到正确 `FlatResult`；
2. **permission**：无 roles、部分 roles、超管三组路由过滤；
3. **menu**：hideInMenu 被过滤，空父节点不残留；
4. **tabs**：关闭当前/非当前/固定 tab，邻页选择正确；
5. **auth reset**：token、userInfo、route remove functions、tabs 与 storage 都回到默认。

若这些逻辑难以测试，优先把纯计算从 Vue 组件/store 中抽为小函数，不先加巨大 mock 框架。

### 4. 补一个关键组件测试

在以下两个中选一个：

- 登录表单：空表单不提交，loading 防重入；
- ExceptionBase：不同 code 渲染对应标题和恢复动作。

不用 snapshot 包住整棵 DOM，断言用户可感知行为。

### 5. 接入 quality 与 CI

R18 的统一命令加入 `bun run test`。CI 本轮至少执行 install → quality → test；R21 再把生产 build 纳入最终交付门。若为了速度并行，仍要让每个失败的阶段可独立定位。

## 验收

- [x] `bun run test` 可一次运行并退出，不停在 watch 模式
- [x] request、permission、menu、tabs、auth reset 五组契约都有至少一个有效断言
- [x] 至少一个关键组件交互测试通过
- [x] 故意改错一个规则时对应测试确实会红，恢复后重新变绿
- [x] 测试不访问真实 Mock 域名，不依赖当前时间或用户本地 storage
- [x] CI 执行测试，失败会阻止通过

R19 实际证据（2026-08-25）：

- 安装 `vitest@4.1.11`、`jsdom@30.0.1`、`@vue/test-utils@2.4.11`；`test` = `vitest run`，`test:watch` 才进 watch；
- Vite/Vitest 共用 `createSrcAlias()`，默认 environment 为 node；ExceptionBase 单文件声明 jsdom；
- 契约用例：成功码 / 业务码 / 网络错误 → FlatResult；无 roles / `R_USER` / `R_SUPER` 过滤；`hideInMenu` 与空父节点不进菜单；关当前/非当前/固定 tab 与 cacheNames；`resetStore` 清 token、userInfo、auth routes、tabs、storage；
- 组件用例：ExceptionBase 403/404/500 标题与主/次动作，click 发出 primary/secondary；额外锁定中英消息键集；
- request 只用 Axios adapter，baseURL 为 `https://request.invalid`；auth 测试使用内存 Storage，不读本机 localStorage；
- 将 `hasRoutePermission` 的超管旁路改成 `return false` 后，超管过滤用例红并得到 `[]`；恢复后 14 tests 全绿；
- `quality` 追加 test；CI 在 frozen install 后分开跑 typecheck/lint/format 与 `bun run test`。

## 常见坑

- **测实现而不测契约**：重构函数名就全红，但用户行为没变。
- **测试打真实 Mock**：外部网络不稳定导致随机失败。
- **全部用 jsdom**：纯函数也绑定浏览器全局，速度与隔离性变差。
- **只看覆盖率**：执行了代码不等于断言了关键结果。

## 思考题

1. 守卫决策树应直接测 Vue Router，还是先抽成纯函数测输入/输出？各自能发现什么错误？
2. 一个永远绿的测试为什么可能比没测试更危险？

## 不要做

- 不要同时引入多套测试框架
- 不要用巨型 snapshot 代替行为断言
- 不要为了测试往产品代码加只有测试才用的开关
