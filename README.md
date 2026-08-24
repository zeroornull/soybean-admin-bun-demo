# Soybean Admin · Bun 重写学习仓库

本仓库正在把 Soybean Admin **用 Bun + TypeScript + 最新 Vue 生态从零重写**，用来学习后台管理系统的内核（启动链、路由守卫、权限、请求封装、布局、主题）。

原 pnpm 版源码已放到 **`legacy/`**（已 gitignore，只作本地对照，不会进版本库）。

## 从这里开始

学习文档在 [`docs/`](./docs/README.md)：

1. [迁移总览](./docs/00-overview.md)
2. [分轮学习路线](./docs/04-learning-path.md)
3. [进度表](./docs/PROGRESS.md)

当前进度：**文档与归档完成，代码从第 0 / 第 1 轮开始写。**

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

默认开发端口见第 1 轮文档（9528，避免和 legacy 撞车）。

## 许可

[MIT](./LICENSE)（与原 Soybean Admin 相同）。
