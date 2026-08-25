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

- [x] `bun run typecheck` 退出 0
- [x] `bun run lint` 只检查不修文件，退出 0
- [x] `bun run format` 只检查格式，退出 0
- [x] `bun run quality` 能稳定重复运行，第二次不产生新 diff
- [x] lint/format/typecheck 不扫描 `legacy/` 与文档代码块制造假失败
- [x] CI 在干净 checkout 上执行 frozen install + quality
- [x] README 列出开发和质量命令

R18 实际证据（2026-08-25）：

- 安装 `oxlint@1.80.0`、`oxfmt@0.65.0`、`simple-git-hooks@2.13.1`；不引入 ESLint/Prettier 第二套 lint/formatter；
- scripts 明确分离 `lint/lint:fix`、`format/format:write`；quality 顺序为 typecheck→lint→format，三个 check 命令都不带 fix/write；
- oxlint 开启 correctness+suspicious error 与 TypeScript/Unicorn/Oxc/Import/Vue plugins；只关闭合法 side-effect import、`.d.ts export {}` 和不适合当前数据变换的三条 Unicorn 规则；
- 首轮 lint 报 15 项：合法 side-effect/module marker 规则例外 2 类；Axios 默认成员改 named import；App/Home 裸响应式依赖改显式 watch/dayjs locale 使用。最终 lint 0；
- 首轮 oxfmt check 只报告 7 个源码文件并退出 1；显式 `format:write` 建立基线并将 Oxc/VS Code JSON 纳入范围后，check 扫 61 个文件全部通过；格式 diff 仅换行/空白，类型与构建复验通过；
- 连续 quality 前后受管文件 SHA-256 均为 `3cf7ea01394e96d37f43187a61a5a211f9b5308aad4a2c4875cd2b5148bf0e58`，git status 也完全一致；
- oxlint `--debug=files` 实际列出 53 个 src/scripts/config 文件，legacy/docs/dist 命中均为 0；format 使用显式 src/scripts/config 范围并有相同 ignore；
- `.editorconfig` 统一 UTF-8/LF/2 空格/final newline；VS Code 只推荐 Oxc + Volar，Oxc 是代码默认 formatter，Markdown 保存格式关闭；
- package 的 `simple-git-hooks.pre-commit` 为 `bun run quality`；`bun run prepare` 成功生成 hook，手动执行 hook 退出 0；hook 不跑 build、不自动 stage/format；
- `.github/workflows/quality.yml` 使用 checkout v4、setup-bun v2 + `bun-version: 1.4.0`、`bun install --frozen-lockfile`、`bun run quality`；R19 再加 test，R21 再加 build；
- 最终 frozen install 检查 225 installs / 300 packages、quality 退出 0、生产 build 通过；R16 ECharts chunk warning 仍按已知边界保留。

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
