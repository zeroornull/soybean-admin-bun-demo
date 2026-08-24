# R20 · 内部包与 Bun workspace

## 学习目标

- 理解 workspace 要解决的问题：复用、边界、独立版本，而不是「看起来专业」
- 用 Bun workspaces 替代 pnpm workspace
- 只抽真正稳定的基础库
- 在 R19 回归测试保护下做边界迁移，每抽一个包就重跑质量门

## 对照 legacy

- `legacy/pnpm-workspace.yaml`
- `legacy/package.json` 的 `workspace:*` 依赖
- `legacy/packages/utils/package.json`
- `legacy/packages/axios/package.json`
- `legacy/packages/hooks/package.json`
- `legacy/packages/color/package.json`

## 何时该抽包

抽：

- 无 `.vue` 文件、无对 `@/` 的依赖
- 被 2 个以上模块使用，或它已形成可独立测试的稳定契约

不抽（本轮）：

- 页面、布局、store
- 还在每周改 API 的 request 业务切面（token、登出码）—— 可以抽「axios 工厂」，但 `src/service/request.ts` 里那些 `useAuthStore()` 应留在应用侧

建议本轮抽出：

| 包名 | 来源 | 内容 |
| --- | --- | --- |
| `@sa/utils` | `src/utils` 里与 Vue 无关的 | storage、clone、nanoid |
| `@sa/color` | 若你已写 palette | 主题色展开 |
| `@sa/axios` | 纯 Axios 工厂 | 不含 Pinia |

hooks 里依赖 Vue 的可以留 `src/hooks`，或抽 `@sa/hooks` 但不要依赖 `@/`。

## 动手步骤

### 0. 锁定抽包前基线

```bash
bun run quality
bun run test
```

两者必须在移动文件前全绿。若准备抽的纯函数没有被 R19 覆盖，先补契约测试，不用抽包后的手工点点看看代替。

### 1. 根 package.json

```json
{
  "workspaces": ["packages/*"]
}
```

删除任何 `pnpm-workspace.yaml`（根目录本就不该有）。

### 2. 包结构

```text
packages/utils/
  package.json
  src/index.ts
  tsconfig.json
```

`package.json`：

```json
{
  "name": "@sa/utils",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Bun + Vite 可以直接吃 TS 源码入口，legacy 也是这么做的。不要先上 tsup，除非你真的要独立发布。

### 3. 应用依赖

```bash
bun add '@sa/utils@workspace:*'
```

应用里：

```ts
import { localStg } from '@sa/utils';
```

### 4. 重装并逐包验证

```bash
bun install
```

确认根 `node_modules/@sa/utils` 链到 `packages/utils`。

一次只抽一个包。每个包迁移后立即跑 `bun run quality && bun run test`，失败时就地修复，不继续移下一个。

同时将 R18 的 lint/format 检查范围从 `src` 扩展为 `src packages`，保证新包不成为质量门盲区。

### 5. 把业务切面留在 app

```ts
// src/service/request.ts
import { createFlatRequest } from '@sa/axios';
import { useAuthStore } from '@/store/auth';

export const request = createFlatRequest(
  { baseURL },
  {
    onRequest(config) { /* 读 token */ return config; },
    onBackendFail() { useAuthStore().resetStore(); }
  }
);
```

工厂在包里，**策略在应用里**。这是 legacy `@sa/axios` 的精髓。

## 验收

- [ ] `bun install` 无报错
- [ ] 应用可以 `import { x } from '@sa/utils'`
- [ ] `bun run dev` 与 `bun run typecheck` 仍过
- [ ] R19 的全部回归测试在抽包后仍通过
- [ ] R18 的 lint/format 已覆盖 `packages/`
- [ ] 没有出现「包里 import `@/store`」
- [ ] 抽包前后用户行为不变，R08/R14 已有的手工验收重跑通过
- [ ] 依赖图无循环，应用层依赖包，基础包不反向依赖应用

## 常见坑

- **包的 exports 指向 `dist/index.js` 但你没构建**：开发会 404。对内包指向 `src/index.ts`。
- **循环依赖**：`@sa/hooks` → `@sa/axios` → `@sa/hooks`。画一张依赖图再抽。
- **tsconfig paths 与 workspace 双通道**：优先让 bundler 走 package exports，少写 `@sa/utils → packages/utils/src` 的重复 alias。
- **一次抽三个包再测**：失败时无法确定是包边界、exports 还是循环依赖。

## 思考题

1. `workspace:*` 和 `workspace:^` 在发布到 npm 时会被写成什么？
2. 为什么 materials（Vue SFC）比 utils 更难抽成包？

## 不要做

- 不要抽 `@sa/scripts` / changelog 工具链
- 不要把整个 `src` 挪进 `packages/app`
