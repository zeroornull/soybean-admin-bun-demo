# 02 · 目标技术栈与版本策略

## 版本策略

- **动手时安装 latest 稳定版**：`bun add vue`、`bun add -d vite`，不要把文档里的数字抄死。
- **文档里的数字是快照**，记录 2026-08-24 在 npm 上查到的版本，方便对照。
- **不使用 canary / alpha** 作为默认路径。
- 某一轮安装后，把实际版本记到 [PROGRESS.md](./PROGRESS.md) 的「实际安装版本」表。

## 2026-08-24 快照

| 包 | 原项目 (legacy) | 当时 npm latest | 重写建议 |
| --- | --- | --- | --- |
| bun | （未使用，pnpm 10） | 本机已装 1.4.0 | 用 Bun 1.4+ 作为包管理器；脚本用 `bun run` |
| vue | 3.5.34 | 3.5.41 | `vue@latest`（3.5 线） |
| typescript | 6.0.3 | **7.0.2** | **钉在 5.9/6.x 最新稳定**，不要默认上 TS 7 |
| vite | 8.0.12 | 8.2.2 | `vite@latest`（8.x） |
| @vitejs/plugin-vue | 6.0.6 | 6.0.8 | 与 Vite 8 配套 |
| vue-tsc | 3.2.8 | 3.3.11 | 与 Vue 3.5 + TS 6 配套 |
| @types/node | 25.7.0 | 26.2.0 | 跟随当前 Node/Vite 工具链 |
| vue-router | 5.0.7 | 5.2.0 | `vue-router@latest`（5.x） |
| pinia | 3.0.4 | **4.0.3** | 优先 Pinia 4；若生态卡住再退回 3 |
| naive-ui | 2.44.1 | 2.45.2 | `naive-ui@latest` |
| unocss | ^66.6.8 | 66.8.1 | 继续 UnoCSS 66 + `presetWind3` 或文档中的继任 preset |
| vue-i18n | 11.4.2 | 11.4.9 | 11.x |
| @vueuse/core | 14.3.0 | 14.4.0 | 14.x |
| axios | 1.16.0 | 1.19.0 | 1.x |
| echarts | 6.0.0 | 6.1.0 | 首页图表用 |
| @iconify/vue | 5.0.1 | 5.0.1 | 图标 |
| dayjs | 1.11.20 | 1.11.23 | 日期 |
| eslint | 10.3.0 | 10.9.0 | R18 再按需上 |
| oxlint | ^1.64.0 | 1.79.0 | R18 建立质量门 |
| vitest | — | 4.1.11 | R19 建立核心回归；当前 peer 支持 Vite 8 |
| jsdom | — | 30.0.1 | R19 DOM 测试环境，纯函数不必使用 |
| @vue/test-utils | — | 2.4.11 | R19 关键 Vue 组件交互测试 |

用下面命令自己复核（不要盲信快照）：

```bash
npm view vue version
npm view vite version
npm view typescript version
npm view vue-router version
npm view pinia version
npm view naive-ui version
npm view vitest version
npm view @vue/test-utils version
```

## 必须单独说的两个版本

### TypeScript 7 先不要用

TypeScript 7.0 是 Go 移植线，**当前没有完整的 JS 程序化 API**。`vue-tsc`、Volar、`typescript-eslint` 都还依赖传统 API。

重写时：

```bash
bun add -d typescript@6
# 若 6 线已停，则 typescript@5
```

把这条写进 [decisions.md](./decisions.md)。等 vue-tsc 明确支持再升。

### Pinia 4

Pinia 4 是 ESM-only，并要求 `@vue/devtools-api` 作为 peer。原项目的 **setup store 写法仍然是正道**。

第 6 轮按 Pinia 4 写。如果 Naive UI / vue-i18n 报 peer 冲突，再钉回 3.x，并在 PROGRESS 里记一笔。

## 保留与替换

| 能力 | 决策 |
| --- | --- |
| 包管理 | **换成 Bun**。lockfile 用 `bun.lock`（文本）。 |
| 运行 dev/build | `bun run dev` 用 Bun 脚本编排本地 Mock，再按常规 Node 路径启动 Vite；不必用 `bun --bun vite` 强行换 runtime。 |
| UI | **保留 Naive UI** |
| CSS | **保留 UnoCSS** |
| 路由库 | vue-router 5；**Elegant Router 第 9 轮以后可选** |
| 请求 | Axios。R08 先写在 `src/service`，R19 锁定回归后，R20 再决定是否抽包 |
| 图表 | 继续 ECharts（首页） |
| 内部 CLI `sa` | 不做 1:1。需要时用简单 bun 脚本 |
| Alova | 默认不用 |
| 镜像 | 原 `.npmrc` 指向 npmmirror。Bun 用 `bunfig.toml` 配 registry |

## 推荐的根目录 package.json 形态（第 1 轮）

```json
{
  "name": "soybean-admin",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite --mode test",
    "build": "vite build --mode prod",
    "preview": "vite preview",
    "typecheck": "vue-tsc --noEmit --skipLibCheck"
  }
}
```

R20 再加：

```json
{
  "workspaces": ["packages/*"]
}
```

Bun 识别根 `package.json` 的 `workspaces`，不再需要 `pnpm-workspace.yaml`。

## 运行时：Node 还是 Bun？

| 用途 | 建议 |
| --- | --- |
| 装依赖、跑 script | Bun |
| Vite 开发服务器 / 构建 | Node 兼容路径（Vite 官方仍以 Node 为第一运行时） |
| 以后写小脚本 | 可以直接 `bun scripts/foo.ts`，省掉 tsx |

原 `engines.node >= 20.19` 仍然有意义：Vite 8 需要新版 Node。本机同时有 Bun 1.4 与 Node 22 即可。

## 镜像

`legacy/.npmrc`：

```ini
registry=https://registry.npmmirror.com/
```

第 0 轮在根目录建 `bunfig.toml`：

```toml
[install]
registry = "https://registry.npmmirror.com/"
```

公司有私有源再改。不要把 token 写进仓库。
