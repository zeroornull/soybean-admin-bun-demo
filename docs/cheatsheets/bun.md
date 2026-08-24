# Bun 速查

本机文档编写时：Bun 1.4.0。以 `bun --help` 为准。

## 日常

| 目的 | 命令 |
| --- | --- |
| 安装依赖 | `bun install` |
| 加生产依赖 | `bun add vue` |
| 加开发依赖 | `bun add -d vite` |
| 加 workspace 包 | `bun add @sa/utils@workspace:*` |
| 移除 | `bun remove vue` |
| 跑 script | `bun run dev` |
| 跑 TS 文件 | `bun scripts/foo.ts` |
| 执行包二进制 | `bunx vue-tsc -v` |
| 更新 | `bun update` |
| 按 lockfile 装（CI） | `bun install --frozen-lockfile` |

## 配置

- `bunfig.toml`：registry、install 行为
- lockfile：现代 Bun 默认文本 `bun.lock`（老版本可能是 `bun.lockb`）。**提交文本 lockfile。**
- workspace：根 `package.json` 的 `"workspaces": ["packages/*"]`

## 和 Vite 一起用

```json
{
  "scripts": {
    "dev": "bun scripts/dev.ts",
    "dev:app": "vite --mode test",
    "build": "vite build --mode prod"
  }
}
```

`bun run dev` 由仓库脚本先启动或复用本地 Mock，再从 `node_modules/.bin` 启动 Vite；`bun run dev:app` 只启动 Vite，供分步排障。不必写成 `bunx vite`。

## 不要做的事

- 根目录混用 `pnpm i` / `npm i` / `bun i`
- 把 `node_modules` 提交进 git
- 在 `legacy/` 里 `bun install` 当对照环境（legacy 保持 pnpm）
