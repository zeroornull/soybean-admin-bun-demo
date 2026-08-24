# R03 · 样式系统：UnoCSS + CSS 变量

## 学习目标

- 搞清 UnoCSS 在 Vite 里如何接入（插件 + `uno.css` 入口）
- 理解 Soybean 用 **CSS 变量做主题**，原子类只是消费变量
- 会用 `dark` class 切暗黑，而不是 `prefers-color-scheme` 一条路走到黑

## 对照 legacy

- `legacy/uno.config.ts`
- `legacy/build/plugins/unocss.ts`
- `legacy/packages/uno-preset/src/index.ts`
- `legacy/src/theme/vars.ts`
- `legacy/src/styles/css/global.css`
- `legacy/src/plugins/assets.ts`

## 动手步骤

### 1. 安装

```bash
bun add -d unocss
```

查阅当前 UnoCSS 文档：preset 名称可能是 `presetWind3` 或更新的 Wind 预设。legacy 用：

```ts
import { defineConfig, transformerDirectives, transformerVariantGroup, presetWind3 } from 'unocss';
```

### 2. `uno.config.ts`

最小可用：

```ts
import { defineConfig, presetWind3, transformerDirectives, transformerVariantGroup } from 'unocss';

export default defineConfig({
  content: {
    pipeline: {
      exclude: ['node_modules', 'dist', 'legacy', 'docs']
    }
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [presetWind3({ dark: 'class' })],
  shortcuts: {
    'card-wrapper': 'rd-8px shadow-sm'
  }
});
```

`exclude` 务必包含 `legacy`，否则扫描旧项目会拖慢。

### 3. Vite 插件

```bash
# unocss 的 Vite 插件随 unocss 包导出
```

```ts
import UnoCSS from 'unocss/vite';

export default defineConfig({
  plugins: [vue(), UnoCSS()]
});
```

### 4. 在 assets 里引入

```ts
import 'virtual:uno.css';
import '../styles/reset.css';
import '../styles/global.css';
```

### 5. 主题变量（先做 3 个）

读 `legacy/src/theme/vars.ts`，不要一次搬全部。先在 `src/styles/global.css`：

```css
:root {
  --layout-bg: #f6f9fb;
  --primary: #646cff;
}

html.dark {
  --layout-bg: #1a1a1a;
  --primary: #7c83ff;
}

html,
body,
#app {
  height: 100%;
}

body {
  background: var(--layout-bg);
}
```

App.vue 上放两个按钮：给 `document.documentElement` 加/删 `dark`。R14 再接到 theme store 与 Naive theme。

### 6. 验证原子类

```vue
<button class="px-12px py-8px bg-primary text-white rd-8px">
  primary
</button>
```

若 `bg-primary` 不是默认 palette，用 `bg-[var(--primary)]` 或在 `uno.config.ts` 的 `theme.colors` 里挂上 `primary: 'var(--primary)'`。legacy 的 `themeVars` 就是干这个的。

## 验收

- [x] 工具类生效：真实 Chrome 计算得到 `display:grid`、`place-items:center`、`padding:24px`、`border-radius:8px`，flex/gap 也已生成规则
- [x] 点击 Dark 后 `html.dark` 生效，布局/面板计算背景切为 `rgb(17, 24, 39)` / `rgb(31, 41, 55)`，点击 Light 可恢复
- [x] `.vue` 中未引入 `<style scoped>`，布局、间距、圆角、阴影和主题色均由 UnoCSS + global CSS 变量提供

R03 实际证据（2026-08-24）：

- 安装 UnoCSS `66.8.1`，Vite 使用 `unocss/vite`，assets 引入 `virtual:uno.css` → reset → global；
- `uno.config.ts` 启用 `presetWind3({ dark: 'class' })`、directives/variant-group transformers，并排除 `node_modules/dist/legacy/docs`；
- `primary` 映射到 `var(--primary)`，`card-wrapper` 生成 8px 圆角与阴影；
- 亮色变量为 layout `#f6f9fb`、card `#ffffff`、primary `#646cff`；暗色为 `#111827`、`#1f2937`、`#7c83ff`；
- 生产构建转换 17 个模块，生成约 5.31 kB CSS，其中已检出 padding/grid/place-items/radius/shadow/primary 规则；
- Chrome DevTools Protocol 实际点击 Dark/Light，并读取 `html.dark`、CSS 变量与 computed style，三段状态全部通过；
- `bun install --frozen-lockfile`、`bun run typecheck`、`bun run build` 均通过，未引入 Sass/Naive/Pinia/Router/i18n。

## 常见坑

- **忘了 `import 'virtual:uno.css'`**：类名全部无效，排错会误以为是 config 写错。
- **扫描到 `legacy/`**：开发变慢，偶发类名冲突。
- **SCSS `additionalData` 全局注入**：legacy 有。本轮不要引入 sass，能 CSS 变量解决就不要预处理器。

## 思考题

1. `transformerDirectives` 让你能在 CSS 里写 `@apply`。什么时候该 `@apply`，什么时候该 shortcut？
2. 为什么主题色要用 CSS 变量，而不是 Uno 的静态 `bg-blue-500`？

## 不要做

- 不要实现完整 theme drawer
- 不要安装 sass，除非你已经需要 `legacy` 里那份 scrollbar mixin
