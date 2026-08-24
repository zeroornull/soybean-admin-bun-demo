# R01 · 脚手架：Bun + TS + Vite + Vue

## 学习目标

- 从零生成一个 **Vite 8 + Vue 3 + TypeScript** 应用，并用 Bun 管理依赖
- 配好路径别名 `@`、`vue-tsc`、环境变量文件
- 理解 `index.html` 才是 Vite 应用的入口，不是 `main.ts` 自己 magically 被找到

## 对照 legacy

- `legacy/index.html`
- `legacy/vite.config.ts`
- `legacy/tsconfig.json`
- `legacy/package.json` 的 `type: module` 与 scripts

## 动手步骤

### 1. 在仓库根目录初始化

不要 `cd legacy`。根目录目前只有 `docs/`、`README.md`、`LICENSE`、gitignore。

两种做法，选一：

**做法 A（推荐，手工，学得清楚）**

```bash
bun init
```

然后按下面清单补文件，删掉 bun init 里用不上的 `index.ts`。

**做法 B**

```bash
bun create vite . --template vue-ts
```

若当前目录非空，create 可能拒绝。那时用临时目录再把文件移回来，或继续用做法 A。

### 2. 安装核心依赖

`bun init` 在 2026-08-24 实测会自动把 latest TypeScript 7 写进 `dependencies`。先检查 `package.json`；如果已有 TypeScript，先移除：

```bash
bun remove typescript
```

然后安装应用与开发依赖：

```bash
bun add vue
bun add -d vite @vitejs/plugin-vue vue-tsc @types/node
```

版本以安装当时 latest 为准。TypeScript **不要装 7**，见 [../02-target-stack.md](../02-target-stack.md)：

```bash
bun add -d typescript@6
```

安装后必须验证实际解析版本，不只看命令参数：

```bash
bunx tsc -v       # 应为 6.x
bunx vue-tsc -v   # 应能正常输出 TypeScript 版本
```

### 3. `index.html`

对标 `legacy/index.html`。新项目使用高位开发端口 19528，避开当前 Windows/WSL 的排除端口区间；preview 使用 19726：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <title>Soybean Admin</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

把 `legacy/public/favicon.svg` 复制到 `public/favicon.svg`。

### 4. `src/main.ts` / `src/App.vue`

这一轮只需要：

```ts
// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

```vue
<script setup lang="ts">
defineOptions({ name: 'App' });
</script>

<template>
  <div class="p-24px">rewrite in progress</div>
</template>
```

`class="p-24px"` 在 R03 才会生效，现在写上没关系，也可以先用行内样式。

### 5. `vite.config.ts`

```ts
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 19528
  },
  preview: {
    port: 19726
  }
});
```

### 6. `tsconfig.json`

对标 legacy，但先不要把整个仓库（含 `docs`、`legacy`）include 进去：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "jsx": "preserve",
    "jsxImportSource": "vue",
    "lib": ["DOM", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    },
    "resolveJsonModule": true,
    "types": ["vite/client", "node"],
    "strict": true,
    "noUnusedLocals": false,
    "skipLibCheck": true,
    "isolatedModules": true,
    "moduleDetection": "force"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "vite.config.ts"],
  "exclude": ["node_modules", "dist", "legacy", "docs"]
}
```

补 `src/vite-env.d.ts`：

```ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
```

### 7. `package.json` scripts

```json
{
  "name": "soybean-admin",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite --mode test",
    "build": "vite build --mode prod",
    "preview": "vite preview",
    "typecheck": "vue-tsc --noEmit --skipLibCheck"
  }
}
```

先放两个空环境文件，R07 再填：

```bash
touch .env .env.test .env.prod
```

`.env`：

```ini
VITE_APP_TITLE=SoybeanAdmin
VITE_BASE_URL=/
```

`vite.config.ts` 里暂时可以不 `loadEnv`。

### 8. 启动

```bash
bun run dev
bun run typecheck
```

## 验收

- [x] 开发页可访问：R01 初验时原端口 9528 因 Windows excluded range 回退到 9554；D14/D15 后已改为从 `19528` 起步并允许占用时自动递增
- [x] `bun.lock` 出现在根目录，为可入库的文本 JSON lockfile
- [x] `bun run typecheck` 退出码 0
- [x] `legacy/` 仍在，根依赖使用 Bun，legacy 依赖保持 pnpm virtual store，未混用包管理器

R01 实际证据（2026-08-24）：

- Vue `3.5.41`、Vite `8.2.2`、`@vitejs/plugin-vue` `6.0.8`、TypeScript `6.0.3`、`vue-tsc` `3.3.11`、`@types/node` `26.2.0`；
- `bunx tsc -v` 与 `bunx vue-tsc -v` 均输出 `6.0.3`；
- `bun run typecheck` 通过；
- 额外构建烟雾 `bun run build` 通过，11 个模块完成转换；
- dev server 的 `GET /`、`GET /src/main.ts`、`GET /src/App.vue`、`GET /favicon.svg` 均返回 HTTP 200，转换后的 App 模块包含 `rewrite in progress`；
- 开发服务器验证后已停止。

## 常见坑

- **include 了 `legacy/**/*.vue`**：vue-tsc 会去检查整份旧项目。exclude 必须包含 `legacy`。
- **包管理器混用**：根目录不要再 `pnpm install`。
- **`typescript@7`**：Volar / vue-tsc 会坏。钉 6.x。
- **直接在 `bun init` 的 TS7 上执行 `bun add -d typescript@6`**：Bun 可能保留已存在的普通 dependency，实际解析仍是 TS7。先 `bun remove typescript`，再加 TS6。
- **忘记 `"type": "module"`**：`vite.config.ts` 里 `import.meta.url` 会出问题。

## 思考题

1. Vite 为什么从 HTML 进，而不是从 `main.ts` 进？
2. `moduleResolution: "bundler"` 和 `"node"` 差在哪？为什么 Vite 项目要用 bundler？

## 不要做

- 不要装 naive-ui / pinia / vue-router（下一轮才上需要的）
- 不要建 `packages/`
- 不要把 Elegant Router 插件拷进来
