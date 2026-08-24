# R00 · 环境准备

## 学习目标

- 分清 **Bun（包管理 / 脚本）** 和 **Node（Vite 运行时依赖）** 各自干什么
- 会用 bun 装包、跑 script，知道 lockfile 叫什么
- 能在 `legacy/` 里把原项目跑起来，后面对照用

## 对照 legacy

- `legacy/package.json` 的 `engines`、`scripts`、`simple-git-hooks`
- `legacy/.npmrc` 的 registry
- `legacy/pnpm-workspace.yaml`

## 动手步骤

### 1. 确认 Node

Vite 8 需要较新的 Node。原项目要求 `>= 20.19`。

```bash
node -v   # 建议 20.19+ 或 22
```

### 2. 确认 Bun

```bash
bun -v
```

若没有：

```bash
curl -fsSL https://bun.sh/install | bash
```

文档编写时本机为 **Bun 1.4.0**。1.1+ 即可。

### 3. 配置镜像（国内网络）

在仓库**根目录**（不是 legacy）创建 `bunfig.toml`：

```toml
[install]
registry = "https://registry.npmmirror.com/"
```

原项目用 npmmirror；你若直连 npm 官方，可跳过。

### 4. 对照安装原项目

```bash
cd legacy
pnpm install
pnpm dev
```

打开 http://localhost:9527 ，用默认演示账号登录一次（账号在登录页或 mock 文档里，常见为 `Soybean` / `123456`，以实际页面提示为准）。

装 pnpm 依赖失败不要卡死整条学习线：R00 的硬性验收是 Bun 可用。legacy 跑不起来时，改为直接读源码。

### 5. 把 bun 命令练一遍（任意空目录即可）

```bash
bun init          # 看看它生成什么（不必提交）
bun add vue       # 等价 pnpm add vue
bun add -d vite   # 等价 pnpm add -D vite
bun run <script>  # 等价 pnpm <script>
bunx vite -v      # 等价 pnpx / pnpm dlx；使用上面已安装的 Vite
```

2026-08-24 实测：`bun init` 会自动加入当时 latest 的 TypeScript 7。本轮不用 `bunx vue-tsc -v` 做练习，因为 `vue-tsc` 仍需要传统 TypeScript API；R01 会先移除 TS7，再安装 TS6 与 `vue-tsc`。

对照表：[../cheatsheets/pnpm-to-bun.md](../cheatsheets/pnpm-to-bun.md)

## 验收

- [x] `bun -v` 有输出：`1.4.0`
- [x] `node -v` ≥ 20.19：`v22.23.2`
- [x] 不需要 `bunfig.toml`：按当前决策使用默认 npm registry
- [x] 能说出：`pnpm-lock.yaml` 将被 `bun.lock` 取代，`pnpm-workspace.yaml` 将被根 `package.json` 的 `workspaces` 取代

R00 实际证据（2026-08-24）：

- `pnpm 11.21.0` 以 frozen lockfile 安装 legacy 的 9 个 workspace / 772 个包；
- 安装命令显式使用官方 `https://registry.npmjs.org/`，不新增镜像配置；
- legacy Vite 8.0.12 启动成功；由于当前 tmux 运行环境占用 9527–9553，本次自动使用 9554；
- `GET /`、`GET /src/main.ts`、`GET /favicon.svg` 均返回 HTTP 200；
- legacy `pnpm typecheck` 通过；
- 临时 Bun 练习目录中 `bun.lock`、`bun run`、`bunx vite`均已实际验证，练习目录已清理。

## 常见坑

- **只装了 Bun 没装 Node**：有的 Vite 插件仍查 `process.versions.node`。两个都要。
- **在 legacy 里执行 bun install**：可以实验，但本课程约定 **legacy 保持 pnpm，根目录才用 bun**，避免对照环境被改乱。
- **把 `legacy/` 提交进 git**：不要。它已在 gitignore。
- **`bun init` 自动安装 TS7**：不要在 R00 因 `bunx vue-tsc` 失败误判 Bun 不可用。R01 必须先 `bun remove typescript`，再安装 TS6。

## 思考题

1. `bun run dev` 和 `bun dev` 有什么差别？（提示：后者是 bun 的二进制入口，不一定等于 package.json scripts）
2. 为什么不建议 `bun --bun node_modules/.bin/vite` 作为默认？

## 不要做

- 不要删 `legacy/`
- 不要在这一轮写 Vue 业务代码
