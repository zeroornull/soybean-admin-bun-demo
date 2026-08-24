# R18 · 工程化质量门

## 学习目标

- 让类型、静态检查、格式与 CI 成为可重复命令
- 分开「只检查」与「自动修复」脚本，CI 不在检查时悄悄改文件
- 明确忽略 `legacy/`、`docs/`、`dist/` 与生成文件的边界
- 配置最小但有效的本地提交检查与 CI，不复制旧项目全部发版流水线

## 对照 legacy

- `legacy/eslint.config.js`
- `legacy/.oxlintrc.json`、`legacy/.oxfmtrc.json`
- `legacy/package.json` 的 `simple-git-hooks`、`lint`、`fmt`、`typecheck`
- `legacy/.editorconfig`、`legacy/.vscode/settings.json`
- `legacy/.github/workflows/linter.yml`

## 动手步骤

### 1. 保持 typecheck 常绿

```bash
bun run typecheck
```

本命令从 R01 就应存在，R18 不是第一次修类型，而是将它纳入统一质量门。有错先修，不用 `@ts-ignore` 或放宽 strict 掩盖。

### 2. 选定 lint / format 工具链

主线建议从 oxlint + oxfmt 开始；只在确实需要 Vue/TypeScript 特定规则时再加 ESLint。

```bash
bun add -d oxlint oxfmt
```

脚本分开：

```json
{
  "scripts": {
    "typecheck": "vue-tsc --noEmit --skipLibCheck",
    "lint": "oxlint src",
    "lint:fix": "oxlint --fix src",
    "format": "oxfmt --check src",
    "format:write": "oxfmt --write src",
    "quality": "bun run typecheck && bun run lint && bun run format"
  }
}
```

具体 CLI 参数以安装当时 `--help` 为准；目标是 check 命令不修文件，write 命令显式修文件。

### 3. 配置 ignore

至少忽略：

- `legacy/**`
- `docs/**` 中只用于教学的代码片段
- `dist/**`
- `node_modules/**`
- 路由/组件自动生成文件（若后续引入）

不要为了消除一个真错误就忽略整个 `src/` 子目录。R20 出现 `packages/` 后，再将它显式加入 lint/format 范围。

### 4. EditorConfig 与编辑器

从 legacy 复用通用设置，将 pnpm 任务与保存脚本改为 Bun。保存时自动格式化可以启用，但不能与两个 formatter 同时抢同一类文件。

### 5. 本地 git hook

学习仓库保持轻量：pre-commit 至少跑 typecheck 或统一 quality，但不在 hook 里跑产品 build。若 formatter 会改文件，hook 应明确失败让你重新 stage，不悠悠修改后继续提交。

### 6. 建立 CI 基线

CI 从本轮起为必须项，至少：

1. checkout；
2. 安装固定 Bun 大版本；
3. `bun install --frozen-lockfile`（以当前 Bun 实际参数为准）；
4. `bun run quality`。

R19 再将 test 纳入，R21 将 build 纳入最终交付门。

## 验收

- [ ] `bun run typecheck` 退出 0
- [ ] `bun run lint` 只检查不修文件，退出 0
- [ ] `bun run format` 只检查格式，退出 0
- [ ] `bun run quality` 能稳定重复运行，第二次不产生新 diff
- [ ] lint/format/typecheck 不扫描 `legacy/` 与文档代码块制造假失败
- [ ] CI 在干净 checkout 上执行 frozen install + quality
- [ ] README 列出开发和质量命令

## 常见坑

- **`lint` 默认带 `--fix`**：CI 修了文件却无法回写，本地检查也不再是纯验证。
- **formatter 与 lint 抢格式规则**：两个工具来回改同一行。
- **hook 太重**：开发者绕过 hook，规则反而失效。
- **CI 不用 frozen lockfile**：网上装出的依赖与本地不同。

## 思考题

1. 为什么 check 命令和 fix/write 命令应分开？
2. `skipLibCheck` 节省了什么，又可能隐藏什么？

## 不要做

- 不要同时引入多个 formatter
- 不要启用 super-linter 扫描整仓库的所有 Markdown
- 不要在 pre-commit 里跑生产 build
