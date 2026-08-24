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

- [ ] 工具类（padding、flex、圆角）生效
- [ ] 切 `html.dark` 后面板背景变化
- [ ] 未引入任何 `.vue` 的 `<style scoped>` 也能给布局类名

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
