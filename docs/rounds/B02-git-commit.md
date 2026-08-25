# B02 · 提交信息规范

B 系列最后一轮。对照 Soybean 的 Conventional Commits CLI，用本地脚本生成 `type(scope): description`，不新建 `@sa/scripts` 包。

## 学习目标

- 提交说明是一种协议，不是随手一句话
- 无 staged 文件时拒绝提交，避免空 commit
- `!` 前缀表示 breaking change，写成 `type(scope)!: description`
- 不替代 `pre-commit` 的 `quality`

## 对照

- `legacy/packages/scripts/src/commands/git-commit.ts`
- `legacy/packages/scripts/src/locales/index.ts` 的 types / scopes

## 边界

- 实现：`src/utils/commit-message.ts` + `scripts/git-commit.ts`
- 命令：`bun run commit`
- 不装 enquirer / kolorist / bumpp / changelog / ncu / rimraf
- 不新建 workspace 包
- 不改 `simple-git-hooks` 的 pre-commit（仍是 quality）
- 交互式在 TTY 里选 type/scope；非交互必须传 `--type --scope --description`
- `--dry-run` 只打印，不执行 `git commit`

## 验收

- [x] 无 staged 文件时退出码非 0
- [x] 合法参数生成 `feat(docs): ...`；`!` 开头变成 `feat(docs)!: ...`
- [x] 未知 type/scope 或空描述被拒绝
- [x] `--dry-run` 不创建 git commit
- [x] `bun run quality` 通过
- [x] 未安装 `@sa/scripts` / enquirer / bumpp

B02 实际证据（2026-08-25）：

- `bun run commit` → `scripts/git-commit.ts`；未装 enquirer / bumpp / `@sa/scripts`；
- 101 tests 全绿，含 format / parse / dry-run / verify；
- CLI：`--help` 退出 0；当前无 staged 时 `--dry-run` 退出 1 并提示先 `git add`；不存在的 `--verify` 文件退出 1。

## 不要做

- 不要接 changelog / release / ncu
- 不要用 commit-msg hook 替换 quality
- 不要扩大业务 CRUD
