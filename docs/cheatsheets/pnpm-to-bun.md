# pnpm → Bun 对照

| pnpm | Bun | 备注 |
| --- | --- | --- |
| `pnpm install` | `bun install` | |
| `pnpm add vue` | `bun add vue` | |
| `pnpm add -D vite` | `bun add -d vite` | 短旗标是 `-d` |
| `pnpm remove vue` | `bun remove vue` | |
| `pnpm exec vue-tsc` | `bunx vue-tsc` | |
| `pnpm dlx create-vite` | `bunx create-vite` | |
| `pnpm dev` | `bun run dev` | 建议写 `run`，避免和 bun 子命令混淆 |
| `pnpm -C packages/utils ...` | `bun run --filter @sa/utils ...` | 以当前 Bun 文档为准 |
| `workspace:*` | `workspace:*` | Bun 支持这个协议 |
| `pnpm-workspace.yaml` | `package.json` `workspaces` | |
| `pnpm-lock.yaml` | `bun.lock` | |
| `.npmrc` `registry=` | `bunfig.toml` `[install] registry=` | |
| `shamefullyHoist: true` | 一般不必 | Bun 的 node_modules 布局不同 |
| `pnpm.overrides` | `package.json` `overrides` | 核对 Bun 文档 |
| `pnpm patch` | 无 1:1，尽量不依赖 patch | |
| `engines.pnpm` | 删掉；可注明 bun 版本 | |
| `simple-git-hooks` 里 `pnpm typecheck` | 改成 `bun run typecheck` | |

## 原项目特有

| 原命令 | 重写 |
| --- | --- |
| `pnpm sa gen-route` | 主线手写路由；或自写 bun 脚本 |
| `pnpm sa git-commit` | 普通 `git commit` |
| `pnpm sa cleanup` | `rm -rf dist node_modules` |
| `pnpm sa update-pkg` | `bun update` |
| `pnpm sa release` | 不做 |
| `pnpm typecheck && pnpm lint && pnpm fmt` | `bun run typecheck && bun run lint && bun run fmt` |
