# B 系列 · 第二波加分

A01–A10 已经覆盖原路线里列出的进阶项。主线 R 编号仍封闭。继续做剩余加分时走 **B 系列**，不要发明 A11。

每轮开始时再写自己的完整文档和验收，和 A 系列相同。本文件只固定边界与顺序。

## 为什么不再续 A

- `04-learning-path.md` 里的 A01–A10 是封闭集合，不是无限加号。
- 剩下三格加分不是同一类故障域：「弹窗登出」是会话码，「全套 `@sa/*`」会撞 D11/D28/D29，「`@sa/scripts`」是仓库 CLI。
- `onModalLogout` 现在和 `onLogout` 一样直接 `resetStore`，这是唯一还露在内核上的协议缺口。

## 轮次

| 轮 | 主题 | 要学会的 | 明确不做 |
| --- | --- | --- | --- |
| B01 | 弹窗登出码 | `7777`/`7778` 先对话框再登出；并发只弹一次 | 不改 expired 刷新；不把所有错误改成弹窗 |
| B02 | 提交信息规范 | 本地 `bun run commit`：type + scope + description | 不装 enquirer 全家桶以外的 bumpp / changelog / ncu / rimraf |

B01 进入条件：A10 done。  
B02 进入条件：B01 done（不依赖 B01 代码，但按顺序做，避免并行改文档口径）。

## B01 边界预告

- 工厂继续只回调 `onModalLogout`，UI 在应用层。
- 需要 Naive 对话框宿主（`NDialogProvider` 或等价 `NModal`），不要引入 `window.$dialog` 全局魔法，除非宿主注册方式与现有 Pinia 切面一样可测。
- Mock 增加可点的「模拟弹窗登出」；确认后才 `resetStore`，取消则保持登录。
- 8888 仍直接登出，9999 仍走 A01 刷新。

## B02 边界预告

- 对照 `legacy/packages/scripts/src/commands/git-commit.ts` 的 Conventional Commits 形态。
- 实现放 `scripts/git-commit.ts`（或同等本地脚本），**不新建** `@sa/scripts` 包，避免把 changelog 流水线一并拖进来。
- 无 staged 文件则失败退出。生成 `type(scope): description`。
- 不替代 pre-commit 的 `quality`，只规范提交说明。

## 明确跳过（不再排轮次）

这些曾出现在加分表或依赖对照里，但与已拍板决策冲突，或会把学习项目扩成第二个 Soybean 全家桶：

| 项 | 原因 |
| --- | --- |
| `@sa/materials` | D29/D31：布局和页签已经本地实现 |
| `@sa/uno-preset` | shortcut 写在 `uno.config.ts` |
| `@sa/hooks` 全量 | `use-table` 是 CRUD；countdown 已有 `use-captcha` |
| `@sa/alova` | 非目标 |
| 官方 `@sa/scripts` 全家桶 | changelog / release / ncu 超出本仓库 |
| nprogress、@vueuse/core、@iconify/vue | 可选皮肤，不隔离新的数据流 |
| Naive 组件自动导入 | A10 已决定 Naive 仍手写 import |
| vite-plugin-vue-devtools | 开发便利，不是功能对等 |

features 里「`@sa/*` workspace 全套」按上表 **skipped**：R20 子集 + 已记录永不抽的包，即收口。不要再开一轮去「补齐」legacy 的 7 个包。

## 停止条件

B01、B02 都 done（或其中一轮被显式 skipped 并写明原因）后，B 系列结束。不要编 C 系列，除非又出现新的、可隔离的内核缺口。
