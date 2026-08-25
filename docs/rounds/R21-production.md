# R21 · 生产构建与部署演练

## 学习目标

- 分清 test/prod mode、Vite build base、Router history base 与服务 baseURL
- 用生产模式完成 build + preview，不把开发服务可用当成交付证据
- 验证根路径与子路径部署，并记录 history fallback 要求
- 检查产物是否泄漏密钥、引用 legacy 或依赖开发时 proxy

## 对照 legacy

- `legacy/.env.prod`
- `legacy/vite.config.ts`
- `legacy/package.json` 的 `build` / `preview`
- `legacy/build/config/index.ts`
- [../decisions.md](../decisions.md) 的部署 public path 决策

## 动手步骤

### 1. 固化生产环境契约

`.env.prod` 至少确定：

- `VITE_BASE_URL`
- `VITE_SERVICE_BASE_URL`
- `VITE_HTTP_PROXY=N`（生产不依赖 Vite dev proxy）
- `VITE_ROUTER_HISTORY_MODE`

不在生产产物中写 secret。前端可读环境变量必然对用户可见。

### 2. 先跑完整质量门

```bash
bun run typecheck
bun run lint
bun run test
bun run build
```

若 R18 定义了统一 `quality` 脚本，可用 `bun run quality && bun run test && bun run build`。不允许 build 成功掩盖 typecheck/test 失败。

### 3. 以生产 mode 预览

```bash
bun run preview
```

在 preview 环境重走：冷启动、登录、刷新会话、直达受保护路由、菜单/tab、主题/i18n、登出、404。

preview 不代表真实 Web 服务配置已正确；它只验证 Vite 产物与客户端运行。

### 4. 演练子路径

将 `VITE_BASE_URL` 临时设为如 `/admin/`，确认：

- Vite asset URL 以 `/admin/` 开头；
- router history base 一致；
- favicon 与静态资源不固定指向根 `/`；
- 刷新 `/admin/home` 时服务端需要 fallback 到 `/admin/index.html`。

验证后把最终选择写入 decisions，不保留临时值。

### 5. 检查产物边界

- `dist/` 无 `legacy/` import 或路径字符串；
- 无本地绝对路径；
- 无私有 token / registry 凭证；
- sourcemap 是否生成由明确部署策略决定；
- 主 chunk 大小警告有记录，但不在没有性能问题时盲目拆包。

### 6. 记录部署要求

根 README 写清：Node/Bun 版本、安装、构建、产物目录、SPA history fallback、public path 和 API 配置方式。不要在本轮直接操作真实生产环境。

## 验收

- [x] typecheck、lint、test、build 全部通过
- [x] preview 中核心用户路径可完整走通
- [x] 生产请求不依赖 `/proxy-default` 开发代理
- [x] 根路径与一个子路径配置都做过构建演练
- [x] history fallback 要求已写入 README
- [x] `dist/` 不含 secret、本地绝对路径或 legacy 依赖
- [x] D12 的最终 public path 已记录

R21 实际证据（2026-08-25）：

- `.env.prod` 明确 `VITE_BASE_URL=/`、`history`、`VITE_HTTP_PROXY=N`、API `http://127.0.0.1:19007`；废弃 19008；
- Vite `base` 与 `import.meta.env.BASE_URL` 对齐；favicon 使用 `%BASE_URL%favicon.svg`；`build.sourcemap=false`；
- `quality` 22 tests 全绿后 `vite build --mode prod` 通过；产物无 `proxy-default` / `legacy/` / 绝对路径 / sourcemap，API 为 19007；
- preview：冷启动登录、刷新恢复、菜单/tab、404 保留原 URL、中英切换、登出后再进 `/home` 带 redirect；XHR 直连 `127.0.0.1:19007`；
- 子路径：临时 `.env.prod.local` `VITE_BASE_URL=/admin/`，asset/favicon 为 `/admin/...`，登录进入 `/admin/home`，刷新仍可用；演练后删除 local 文件并恢复根路径构建；
- CI 增加 `bun run build`；Home chunk `724.32 kB / gzip 226.27 kB` 的 500kB warning 仍按 D22 保留。

## 常见坑

- **dev 能登录，preview 不能**：生产误用 Vite dev proxy 或 `.env.prod` 地址失效。
- **asset base 改了，router base 没改**：子路径资源能加载但路由错位。
- **preview 通过就宣称可部署**：真实 Nginx/CDN 还需要 history fallback 与缓存配置。
- **为消除 chunk 警告盲目 manualChunks**：可能制造更差的缓存与依赖图。
- **Bun 预加载 `.env` 盖住 `.env.prod`**：preview 子进程若继承 `VITE_*`，子路径 base 会对不齐，`/admin/assets/*` 全部变成 HTML。

## 思考题

1. Vite preview 能验证什么，又不能验证什么？
2. 为什么 `VITE_*` 不能被当作运行时秘密？

## 不要做

- 不要在本轮部署到真实生产环境
- 不要将 secret 写入 `VITE_*`
- 不要用 build 成功代替 typecheck/test 成功
