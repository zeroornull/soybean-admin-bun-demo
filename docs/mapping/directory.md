# 目录对照

`legacy/` 为原项目。新项目在仓库根。标记「Rxx」表示建议首次出现的轮次。

## 根配置

| legacy | 新项目 | 轮次 | 说明 |
| --- | --- | --- | --- |
| `package.json` | `package.json` | R01 | scripts 改 bun；去掉 sa CLI |
| `pnpm-lock.yaml` | `bun.lock` | R01 | 入库新 lockfile |
| `pnpm-workspace.yaml` | `package.json#workspaces` | R20 | R00–R19 不要 |
| `.npmrc` | 不建 `bunfig.toml` | R00 | D13：默认 npm registry |
| `vite.config.ts` | `vite.config.ts` | R01 | 可逐步内联 `build/` |
| `tsconfig.json` | `tsconfig.json` | R01 | exclude `legacy` `docs` |
| `uno.config.ts` | `uno.config.ts` | R03 | |
| `index.html` | `index.html` | R01 | |
| `eslint.config.js` | 不引入 ESLint | R18 | D24：oxlint + oxfmt |
| `.oxlintrc.json` / `.oxfmtrc.json` | 同名 | R18 | |
| `.env*` | `.env*` | R01/R07 | |
| `build/` | 先内联，必要时 `build/` | R01+ | |
| `packages/` | `packages/` | R20 | 稳定子集，R19 先锁定回归 |
| `src/` | `src/` | R01 | |
| `public/` | `public/` | R01 | |
| `.github/` | 重建最小 CI | R18 | 不要原样拷 super-linter |
| 无 | Vitest 配置 | R19 | 复用 Vite alias，不建另一套路径规则 |
| `CHANGELOG*` | 不搬 | — | 那是旧项目历史 |

## src

| legacy | 新项目建议 | 轮次 |
| --- | --- | --- |
| `src/main.ts` | 同左 | R01/R02 |
| `src/App.vue` | 同左 | R02/R13/R14 |
| `src/plugins/*` | 同左，先 loading/assets | R02 |
| `src/styles/*` | 同左，可只留 css | R03 |
| `src/router/index.ts` | `src/router/index.ts` | R04 |
| `src/router/routes/*` | `src/router/routes.ts` | R04 |
| `src/router/guard/*` | `src/router/guards.ts` | R10 |
| `src/router/elegant/*` | 本地生成器 + 手写 transform（A03） | A03 |
| `src/layouts/base-layout` | `src/layouts/base-layout.vue` | R05 |
| `src/layouts/blank-layout` | `src/layouts/blank-layout.vue` | R04 |
| `src/layouts/modules/*` | `src/layouts/modules/*` 精简 | R05/R11/R12 |
| `src/store/modules/*` | `src/store/*.ts` 扁平亦可 | R06 |
| `src/store/plugins` | `src/store/plugins/reset.ts` | R06 |
| `src/service/request` | `src/service/request.ts` | R08 |
| `src/service/api` | `src/service/api` | R08 |
| `src/views/_builtin/login` | `src/views/login` | R09/R15 |
| `src/views/_builtin/403,404,500` | `src/views/_builtin/*` | R17 |
| `src/views/_builtin/iframe-page` | `src/views/_builtin/iframe-page` | A09 |
| `src/views/home` | `src/views/home` | R04/R16 |
| `src/locales` | `src/locales` | R13 |
| `src/theme` | `src/theme` | R14 |
| `src/hooks` | `src/hooks` | 随用随建 |
| `src/utils` | `src/utils` → 部分进 `@sa/utils` | R06/R08/R20 |
| `src/components` | `src/components` | R11+ |
| `src/typings` | `src/types` | R07 |
| `src/constants` `src/enum` | `src/constants` | 随用 |
| `src/assets` | `src/assets` | 按需复制 |

## packages

| legacy 包 | 新项目 | 轮次 |
| --- | --- | --- |
| `@sa/axios` | 已抽工厂；token/env/session 留应用层 | R08/R20 |
| `@sa/utils` | `createPrefixedStorage` | R20 |
| `@sa/hooks` | 不抽 | R20 |
| `@sa/color` | hex/混色/主色 palette | R14/R20 |
| `@sa/materials` | 不抽，布局自己写 | R05 |
| `@sa/uno-preset` | 不抽，必要 shortcut 写进 `uno.config.ts` | R03 |
| `@sa/scripts` | 不做 | — |
| `@sa/alova` | 不做 | — |
