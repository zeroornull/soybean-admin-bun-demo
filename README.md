# Soybean Admin · Bun 重写学习仓库

本仓库正在把 Soybean Admin **用 Bun + TypeScript + 最新 Vue 生态从零重写**，用来学习后台管理系统的内核（启动链、路由守卫、权限、请求封装、布局、主题）。

原 pnpm 版源码已放到 **`legacy/`**（已 gitignore，只作本地对照，不会进版本库）。

## 从这里开始

学习文档在 [`docs/`](./docs/README.md)：

1. [迁移总览](./docs/00-overview.md)
2. [分轮学习路线](./docs/04-learning-path.md)
3. [进度表](./docs/PROGRESS.md)

当前进度：**R00–R17 已完成，下一轮为 R18 工程化质量门。**

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

`bun run dev` 会先检查 `127.0.0.1:19007`：本地 Mock 未运行时自动启动，已经运行时直接复用；随后启动 Vite，并通过 `/proxy-default` 转发请求。按 `Ctrl+C` 时只清理本次命令创建的进程，不会关闭预先启动的 Mock。

需要分开排查服务时，可在两个终端分别运行 `bun run mock` 与 `bun run dev:app`。

开发端口从 `19528` 起步，preview 端口从 `19726` 起步。若起始端口被占用，Vite 按默认行为自动尝试后续端口，启动时以终端打印的 Local URL 为准。

本地 Mock 账号：

```text
超管：Soybean / 123456（R_SUPER）
普通：User / 123456（R_USER）
```

## 许可

[MIT](./LICENSE)（与原 Soybean Admin 相同）。
