# R22 · 功能对等、文档与最终验收

## 学习目标

- 用功能清单、自动化质量门和生产模式手工路径共同证明重写完成
- 区分「必须项完成」、「加分项未做」与「残留缺陷」
- 将实际版本、关键决策、启动/构建方式和已知限制写入仓库
- 清理临时代码与学习脚手架，但不为「看起来干净」删除有效证据

## 对照

- [../mapping/features.md](../mapping/features.md)
- [../PROGRESS.md](../PROGRESS.md)
- [../decisions.md](../decisions.md)
- R19 的自动化测试结果（并已在 R20 抽包后重跑）
- R21 的生产构建/预览记录

## 验收前置

只有 R00–R21 均为 `done` 或有明确、合理的 `skipped` 记录时，才开始本轮。不要用 R22 的「集中修一修」替代前面轮次未通过的验收。

## 动手步骤

### 1. 跑最终质量门

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run test
bun run build
```

若实际 Bun 版本的 frozen 参数不同，以 `bun install --help` 为准并更新文档。任一命令失败都先回到所属轮次修复，不在 PROGRESS 提前标 done。

### 2. 逐条勾功能对等清单

打开 `mapping/features.md`，每一个「必须」项都必须有实际验证。代码存在、类型通过或截图看起来对，都不能单独替代行为验证。

加分项只有三种结果：

- 已完成并验证；
- 明确不做，记到 decisions；
- 留作后续，记录优先级与前置条件。

不要把「没来得及」写成「已跳过」而不说明影响。

### 3. 用生产 preview 走完整手工路径

1. 清空 storage 后冷启动 → login；
2. 空表单 / 错误密码；
3. 正确登录 → home；
4. 刷新 home，会话恢复；
5. 折叠侧栏，点菜单，检查面包屑/tab/KeepAlive/重载；
6. 切中英与亮暗，刷新检查持久化；
7. 访问受限页 → 403；
8. 访问未知 path → 404；
9. 登出后直接输入 `/home` → 带 redirect 的 login；
10. 360px 宽度重跑登录、布局、home 与异常页。

### 4. 清理临时物

- 删除 R07/R08 的临时请求按钮与调试 `console.log`；
- 删除 R09 页面级临时守卫；
- 删除 R10 的 `R_NOBODY` 测试页，或明确标为 demo；
- 删除无使用资产与临时占位；
- 确认无对 `legacy/` 的 import；
- 确认 `legacy/`、`node_modules/`、`dist/` 未进入 git。

不删除 R19 的回归测试；它们是交付物，不是临时脚手架。

### 5. 更新文档与实际版本

- `PROGRESS.md`：完成日、精确版本、必要备注；
- `decisions.md`：Pinia、TS、动态路由、抽包、public path、未做加分项；
- 根 `README.md`：前置条件、安装、开发、测试、构建、preview、部署注意；
- `mapping/features.md`：只在浏览器验证后勾选。

### 6. 做一次知识验收

不看文档，能画出并解释：

1. `main.ts` 启动链；
2. 登录、会话恢复与登出数据流；
3. 守卫决策树与 auth route 生命周期；
4. request 的 HTTP/业务码/会话失效分流；
5. route → menu/breadcrumb/tab/cache 的投影关系；
6. app locale 与 theme 如何驱动 Vue/Naive/dayjs/CSS。

讲不清的链路就是知识债，应回到对应轮次补一次小实验，不用加新业务页来掩盖。

## 最终验收

- [ ] R00–R21 状态真实，无提前标记 `done`
- [ ] `bun install --frozen-lockfile`、typecheck、lint、test、build 全部通过
- [ ] `features.md` 所有必须项都有浏览器验证
- [ ] 生产 preview 的完整手工路径通过
- [ ] 桌面与 360px 宽度的核心路径均可用
- [ ] 无产品代码引用 `legacy/`，无 secret 或调试临时物进产物
- [ ] 实际版本、关键决策、启动/测试/部署文档已收口
- [ ] 能不看文档解释六条核心数据流

## 常见坑

- **把 R22 当成大杂烩修复轮**：说明前面的 stop condition 没执行。
- **只跑 build**：不能证明类型、行为回归或产品路径正确。
- **加分项未做装成已完成**：破坏进度文档的信用。
- **为清理删测试**：把最重要的可重复证据删掉。

## 思考题

1. 本次重写中，哪一层你是「看懂了再写」，哪一层仍是「对着 legacy 敲」？后者是下一次学习债的起点。
2. 若下周换 UI 库，哪些文件应变，request/guard/store 中哪些边界应保持？

## 不要做

- 不要在未通过质量门与必须清单时宣称完成
- 不要为了收尾把 `legacy/` 从 gitignore 移除
- 不要在本轮临时扩展系统管理 CRUD 或其他新业务
