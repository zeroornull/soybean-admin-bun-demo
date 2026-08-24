# Soybean Admin 重写学习文档

这是一套**对照原项目、用 Bun + TypeScript + 最新 Vue 生态从零重写**的分轮学习文档。

原 Soybean Admin 源码已归档到仓库根目录的 `legacy/`（该目录已被 gitignore，只留在本地作对照）。新项目将在仓库根目录逐步长出来。

## 先读这三份

1. [00-overview.md](./00-overview.md) — 为什么重写、学什么、不做什么
2. [04-learning-path.md](./04-learning-path.md) — 分轮地图、每轮时长与验收
3. [PROGRESS.md](./PROGRESS.md) — 当前进行到哪一轮

需要对照旧代码时再看：

- [01-current-audit.md](./01-current-audit.md) — 原项目盘点
- [02-target-stack.md](./02-target-stack.md) — 目标技术栈与版本策略
- [03-architecture.md](./03-architecture.md) — 新旧架构对照
- [mapping/](./mapping/) — 目录 / 依赖 / 功能对照表
- [cheatsheets/](./cheatsheets/) — Bun 与 pnpm 命令速查

## 怎么学

- **一轮一事**：不要把后面轮次的布局、权限、workspace 提前塞进脚手架。
- **先跑通再抽象**：能在 `src/` 里写明白的，R20 之前不要拆内部包；R19 先用测试锁定行为。
- **对照 legacy，不复制粘贴**：每轮文档都标了「去 legacy 看哪几个文件」。先读懂再自己写。
- **每轮有验收**：跑不起来、类型过不了、对不上清单，就不要进入下一轮。
- **记录决策**：和文档不一致的选择写进 [decisions.md](./decisions.md)。

建议节奏：一轮一个完整时段（约 1.5–4 小时）。路线已重核为 R00–R22，共 23 轮；详见 [04-learning-path.md](./04-learning-path.md) 的拆分依据。R00 装环境之后，从 R01 脚手架开始写代码。

## 仓库布局（当前）

```text
.
├── docs/          ← 你正在看的文档（纳入 git）
├── legacy/        ← 原 pnpm 版 Soybean Admin（本地对照，不入库）
├── README.md      ← 根目录说明
└── LICENSE
```

第 1 轮完成后，根目录会多出 `package.json`、`src/`、`vite.config.ts` 等新项目文件。

## 想先看原项目怎么跑

`legacy/` 仍是完整的 pnpm 项目：

```bash
cd legacy
pnpm install
pnpm dev
```

默认开发服务在 `http://localhost:9527`。
