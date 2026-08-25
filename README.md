# Soybean Admin · Bun 重写学习仓库

本仓库正在把 Soybean Admin **用 Bun + TypeScript + 最新 Vue 生态从零重写**，用来学习后台管理系统的内核（启动链、路由守卫、权限、请求封装、布局、主题）。

原 pnpm 版源码已放到 **`legacy/`**（已 gitignore，只作本地对照，不会进版本库）。

## 从这里开始

学习文档在 [`docs/`](./docs/README.md)：

1. [迁移总览](./docs/00-overview.md)
2. [分轮学习路线](./docs/04-learning-path.md)
3. [进度表](./docs/PROGRESS.md)

当前进度：**R00–R22 主线已完成；A01–A10 已完成。** 第二波加分是 B 系列，下一可选 B01 弹窗登出码。默认仍是静态路由，动态模式设 `VITE_AUTH_ROUTE_MODE=dynamic`。

## 对照运行原项目

```bash
cd legacy
pnpm install
pnpm dev
```

浏览器：http://localhost:9527

## 新项目（完成 R01 之后）

```bash
bun install
bun run dev
```

`bun run dev` 会先检查 `127.0.0.1:19007`：本地 Mock 未运行时自动启动，已经运行时直接复用；随后启动 Vite，并通过 `/proxy-default` 转发默认 API、`/proxy-demo` 转发其它服务（`127.0.0.1:19008`）。按 `Ctrl+C` 时只清理本次命令创建的进程，不会关闭预先启动的 Mock。

需要分开排查服务时，可在两个终端分别运行 `bun run mock` 与 `bun run dev:app`。

开发端口从 `19528` 起步，preview 端口从 `19726` 起步。若起始端口被占用，Vite 按默认行为自动尝试后续端口，启动时以终端打印的 Local URL 为准。

## 生产构建与预览

前置：Bun 1.4.x、Node 20.19+（当前验证为 Node 22.23.2）。

```bash
bun install --frozen-lockfile
bun run quality          # typecheck + lint + format + test
bun run build            # vite build --mode prod，产物在 dist/
bun run preview          # 编排本地 Mock + vite preview --mode prod
```

生产请求**不走**开发代理，而是直连 `.env.prod` 的 `VITE_SERVICE_BASE_URL`（本地预览默认为 `http://127.0.0.1:19007`）和 `VITE_OTHER_SERVICE_BASE_URL` 里的其它服务（默认 `http://127.0.0.1:19008`）。把应用部署到真实环境时，把这些地址换成实际 API，不要把 Mock 主机名带上线。

默认 public path 为 `/`（D12）。若要挂在子路径，构建前设置 `VITE_BASE_URL=/admin/`（建议带首尾斜杠），然后重建。Vite asset、favicon 与 Vue Router `history` base 都读这个值。

History 模式部署必须配置 SPA fallback：

- 根路径：未知路径回退到 `/index.html`（Nginx 例：`try_files $uri $uri/ /index.html;`）
- 子路径 `/admin/`：回退到 `/admin/index.html`（`try_files $uri $uri/ /admin/index.html;`）

`vite preview` 只证明产物和客户端路由能跑，不代替 Nginx/CDN 的 fallback 与缓存配置。当前关闭 sourcemap。Home 的 ECharts chunk 会触发 Vite 500kB warning，这是已知体积，不是构建失败。

本地 Mock 账号：

```text
超管：Soybean / 123456（R_SUPER）
普通：User / 123456（R_USER）
```

## 质量命令

```bash
bun run gen:routes   # 从 src/views 生成 elegant 路由表
bun run typecheck    # Vue + TypeScript 类型检查
bun run lint         # oxlint 纯检查，不修改文件
bun run lint:fix     # 显式应用 oxlint 安全修复
bun run format       # oxfmt 纯格式检查
bun run format:write # 显式写入格式化结果
bun run test         # Vitest 单次运行，不进入 watch
bun run test:watch   # Vitest watch
bun run quality      # typecheck + lint + format + test
bun run build        # 生产构建（CI 交付门）
bun run preview      # Mock + 生产预览
bun run preview:app  # 只启动 vite preview --mode prod
```

pre-commit 执行 `bun run quality`，不会自动改文件，也不会运行产品 build。GitHub Actions 使用 Bun `1.4.0`、frozen lockfile，并分开跑 quality 检查、`bun run test` 与 `bun run build`。

## 许可

[MIT](./LICENSE)（与原 Soybean Admin 相同）。
