# 决策记录

格式：日期、决策、原因、替代方案。后面轮次如果改了，追加一条，不要默默改历史。

## 已拍板（文档编写时）

### D1 · 原代码进 `legacy/` 且 gitignore

- **原因**：重写从零开始，避免在 300+ 文件上打补丁学不清楚；本地仍要对照。
- **替代**：orphan 分支。更干净但对照不方便。
- **注意**：`legacy/` 只在你的磁盘上。换机器需要自己拷或重新 clone 原 upstream。

### D2 · 包管理器换 Bun，Vite 仍走常规 Node 路径

- **原因**：Bun 当安装器已经够学；Vite 8 的第一运行时仍是 Node。
- **替代**：`bun --bun vite`。出问题再退回。

### D3 · TypeScript 钉 6.x，不上 7

- **原因**：TS 7 缺 JS 程序化 API，vue-tsc / Volar / typescript-eslint 会坏。
- **替代**：等官方工具链声明支持。
- **R00 实测**：Bun 1.4.0 的 `bun init` 会自动加入 TypeScript 7.0.2；必须先移除，再安装 TypeScript 6.0.3。`vue-tsc` 3.3.11 在 TS6 下可正常运行。

### D4 · R00–R19 单包，R19 锁回归，R20 再 workspace

- **原因**：先学会数据流。
- **替代**：第一天就拆 7 个包（legacy 做法）。学习效率差。

### D5 · 路由主线手写，Elegant Router 后置

- **原因**：守卫、动态 addRoute、菜单投影必须先懂。
- **替代**：一上来文件即路由。

### D6 · 保留 Naive UI + UnoCSS

- **原因**：这是本模板的身份。换 UI 库是另一个课题。
- **替代**：Ant Design Vue / Element Plus 官方兄弟仓库。

### D7 · 默认 Axios，不用 Alova

- **原因**：应用入口本来就用 `@sa/axios`。Alova 包在仓库里但是备选。
- **替代**：第 7 轮后若你想学请求库，可另开实验分支。

### D8 · 功能范围以本仓库 views 为准，不扩系统管理 CRUD

- **原因**：这份代码的 `src/views` 只有 builtin + home。
- **替代**：自己加业务模块，不写入「必须」清单。

## 待你在对应轮次填写

### D9 · Pinia 4 还是 3

- 实际版本：
- 是否遇到 peer 冲突：

### D10 · 是否实现动态路由

- 是/否：
- 后端路由 JSON 如何映射到组件：

### D11 · 抽出了哪些 `@sa/*` 包

- 列表：

### D12 · 部署 public path（R21 演练后填）

- `VITE_BASE_URL=`

### D13 · 使用默认 npm registry，不创建 `bunfig.toml`

- **日期**：2026-08-24
- **决策**：根目录 Bun 工作流使用默认 npm registry，不配置 npmmirror。
- **原因**：当前环境可直连 npm，且用户明确不需要镜像源。
- **验证**：R00 的 Bun 临时安装与 legacy pnpm frozen install 均通过；legacy 安装命令也显式覆盖为 `https://registry.npmjs.org/`。
- **替代**：后续若网络环境变化，再评估项目级 `bunfig.toml`；不将凭证写入仓库。
