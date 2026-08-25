# 决策记录

格式：日期、决策、原因、替代方案。后面轮次如果改了，追加一条，不要默默改历史。

## 已拍板（文档编写时）

### D1 · 原代码进 `legacy/` 且 gitignore

- **原因**：重写从零开始，避免在 300+ 文件上打补丁学不清楚；本地仍要对照。
- **替代**：orphan 分支。更干净但对照不方便。
- **注意**：`legacy/` 只在你的磁盘上。换机器需要自己拷或重新 clone 原 upstream。

### D2 · 包管理器换 Bun，Vite 仍走常规 Node 路径

- **原因**：Bun 当安装器已经够学；Vite 8 的第一运行时仍是 Node。
- **替代**：`bun --bun vite`。出问题再退回。

### D3 · TypeScript 钉 6.x，不上 7

- **原因**：TS 7 缺 JS 程序化 API，vue-tsc / Volar / typescript-eslint 会坏。
- **替代**：等官方工具链声明支持。
- **R00 实测**：Bun 1.4.0 的 `bun init` 会自动加入 TypeScript 7.0.2；必须先移除，再安装 TypeScript 6.0.3。`vue-tsc` 3.3.11 在 TS6 下可正常运行。

### D4 · R00–R19 单包，R19 锁回归，R20 再 workspace

- **原因**：先学会数据流。
- **替代**：第一天就拆 7 个包（legacy 做法）。学习效率差。

### D5 · 路由主线手写，Elegant Router 后置

- **原因**：守卫、动态 addRoute、菜单投影必须先懂。
- **替代**：一上来文件即路由。

### D6 · 保留 Naive UI + UnoCSS

- **原因**：这是本模板的身份。换 UI 库是另一个课题。
- **替代**：Ant Design Vue / Element Plus 官方兄弟仓库。

### D7 · 默认 Axios，不用 Alova

- **原因**：应用入口本来就用 `@sa/axios`。Alova 包在仓库里但是备选。
- **替代**：第 7 轮后若你想学请求库，可另开实验分支。

### D8 · 功能范围以本仓库 views 为准，不扩系统管理 CRUD

- **原因**：这份代码的 `src/views` 只有 builtin + home。
- **替代**：自己加业务模块，不写入「必须」清单。

## 对应轮次已填

### D9 · Pinia 4 还是 3

- **日期**：2026-08-24
- **实际版本**：Pinia 4.0.3
- **是否遇到 peer 冲突**：Pinia 4 要求 `@vue/devtools-api`。已作为直接依赖安装 `8.2.1`，未降回 Pinia 3，Naive UI / vue-i18n 无因此卡住。
- **原因**：目标栈优先 Pinia 4；setup store + 受限 `$reset` 与 Pinia 4 兼容。
- **替代**：若后续生态 peer 无法满足，再钉回 3.x 并在本条追加。

### D10 · 是否实现动态路由

- **日期**：2026-08-24（R10）
- **是/否**：否。主线使用静态 `authRoutes`（`src/router/routes.ts`）+ roles 过滤 + `addRoute`/`removeRoute`。
- **后端路由 JSON 如何映射到组件**：未实现。`VITE_AUTH_ROUTE_MODE=static`，超管角色为 `R_SUPER`。
- **原因**：先把守卫决策树、刷新恢复和 403/404 分流学清楚；动态路由是加分项 A02，不阻塞主线。
- **替代**：R22 后按 [04-learning-path.md](./04-learning-path.md) 的 A02 另开进阶轮。

### D10 追加 · A02 实现 dynamic，默认仍 static

- **日期**：2026-08-25（A02）
- **是/否**：可选。`.env` 默认 `static`。设 `VITE_AUTH_ROUTE_MODE=dynamic` 后走 `GET /route/getUserRoutes`。
- **后端 JSON 如何映射到组件**：`component` 字符串必须命中 `routeComponentMap` 白名单（`layout.base` / `home` / `restricted`），禁止任意路径 `import()`。
- **403**：`GET /route/isRouteExist?path=` 判断系统是否存在该业务 path；存在但未注册 → 403，不存在 → 404。

### D11 · 抽出了哪些 `@sa/*` 包

- **日期**：2026-08-25（R20）
- **列表**：
  - `@sa/utils`：`createPrefixedStorage`。应用 key 与 `VITE_STORAGE_PREFIX` 仍在 `src/utils/storage.ts`。未发明当前用不到的 clone/nanoid。
  - `@sa/color`：hex 校验、混色、主色 palette。无 `@sa/utils` / colord 依赖。
  - `@sa/axios`：纯 `createFlatRequest` 工厂。token、env、proxy、session 回调留在 `src/service/request/index.ts`。
- **依赖方向**：应用 → `@sa/*`；`@sa/axios` → `axios`；`@sa/utils` 与 `@sa/color` 无互相依赖。包内不引用 `@/` 或 Pinia。
- **不做**：`@sa/hooks`、`@sa/materials`、`@sa/scripts`、`@sa/alova`、`@sa/uno-preset`。

### D12 · 部署 public path

- **日期**：2026-08-25
- **决策**：默认 `VITE_BASE_URL=/`。子路径已用临时 `.env.prod.local` 演练 `/admin/`，不把子路径留作仓库默认。
- **验证**：根路径 preview 核心路径通过；`/admin/` 构建后 favicon/JS 为 `/admin/...`，router 进入 `/admin/home`，刷新 `/admin/home` 依赖 SPA fallback。
- **原因**：本仓库作为学习默认部署在站点根；真实子路径部署改 env 后重建即可。
- `VITE_BASE_URL=/`

### D13 · 使用默认 npm registry，不创建 `bunfig.toml`

- **日期**：2026-08-24
- **决策**：根目录 Bun 工作流使用默认 npm registry，不配置 npmmirror。
- **原因**：当前环境可直连 npm，且用户明确不需要镜像源。
- **验证**：R00 的 Bun 临时安装与 legacy pnpm frozen install 均通过；legacy 安装命令也显式覆盖为 `https://registry.npmjs.org/`。
- **替代**：后续若网络环境变化，再评估项目级 `bunfig.toml`；不将凭证写入仓库。

### D14 · 新项目改用 strict 高位端口 19528 / 19726

- **日期**：2026-08-24
- **决策**：Vite dev 使用 `19528`，preview 使用 `19726`，两者开启 `strictPort: true`。
- **原因**：Windows TCP excluded ranges 包含 `9454–9553` 与 `9559–9658`，原 dev 端口 9528 在 WSL 中无法 bind；默认自动递增又会隐藏真实端口。
- **验证**：19528/19726 不在 Windows excluded ranges 内，改动前 Linux/Windows 两侧均无 listener；strict dev HTTP 与 headless Chrome、strict preview 均通过。
- **替代**：若未来冲突，显式更换为另一个已验证的高位端口；不恢复自动漂移。

### D15 · 高位端口保留，恢复 Vite 自动递增

- **日期**：2026-08-24
- **决策**：保留 dev `19528` / preview `19726` 作为起始端口，移除 `strictPort`，端口占用时允许 Vite 自动尝试后续端口。
- **原因**：高位端口已避开当前 Windows excluded ranges，但未来仍可能被其他开发服务或 IDE 转发占用；自动递增能提高启动容错性。
- **验证**：19528 已有开发服务、Windows Cursor 又监听 19529 时，第二个 dev 连续跳过两个端口，自动选择 19530 并 HTTP 200；临时占用 19726 时，preview 自动选择 19727，HTML 与生产 JS 均 HTTP 200。
- **运行约定**：实际 URL 以 Vite 启动时打印的 `Local` 地址为准，不在脚本或文档中假设必然是起始端口。

### D16 · 放弃需 Token 的 Apifox 云 Mock，改用本地协议 Mock

- **日期**：2026-08-24
- **决策**：`.env.test` 指向 `127.0.0.1:19007`，`.env.prod` 暂指向 `127.0.0.1:19008` 并关闭 dev proxy；使用 `bun run mock` 启动仓库内的 Node HTTP 协议服务。
- **原因**：legacy Apifox 项目已开启 Token 鉴权，正确/错误登录都返回 HTTP 500 + `apifoxError 401`；不将云 Mock token 写入仓库或 `VITE_*`。
- **协议**：`GET /health`；`POST /auth/login`，`Soybean/123456` 返回 `0000`，其他凭证返回 `1001`；允许 CORS，只使用明确的 mock token 文字。
- **验证**：Vite test proxy target/rewrite、curl direct/proxy、Chrome 同源 proxy/跨源 direct fetch 均通过，Mock 日志收到的是去前缀后的 `/auth/login`。
- **后续**：R08 在该协议上建 request 层；R09 扩展 userInfo/refresh 接口；R21 再决定真实生产 baseURL，不将 19008 当成最终部署地址。

### D16 追加 · R21 本地生产 API

- **日期**：2026-08-25
- **决策**：`.env.prod` 的 `VITE_SERVICE_BASE_URL` 改为 `http://127.0.0.1:19007`，`VITE_HTTP_PROXY=N`。放弃 19008 占位。生产构建直连 Mock（CORS），不走 `/proxy-default`。
- **原因**：本仓库没有真实后端；本地 preview 必须能登录。真实上线时替换该 URL，不要把 19007 写进对外环境。
- **验证**：preview 中 login/getUserInfo/health 的请求主机为 `127.0.0.1:19007`，产物不含 `proxy-default`。

### D17 · `bun run dev` 自动编排本地 Mock 与 Vite

- **日期**：2026-08-24
- **决策**：默认开发命令先探测 `127.0.0.1:19007/health`；服务不存在时启动仓库内 Mock，存在时复用，然后启动 Vite。保留 `bun run mock` 与 `bun run dev:app` 供分步排障。
- **原因**：只启动 Vite 时，浏览器请求虽能到达 proxy，但目标端口没有 Mock 监听，登录会稳定失败并报 `ECONNREFUSED 127.0.0.1:19007`；默认命令应建立完整的本地开发依赖链。
- **进程边界**：编排器只关闭自己启动的 Mock/Vite；预先存在的 Mock 不归它所有，退出时不得误杀。Mock 或 Vite 子进程意外退出时，清理另一条自有进程并以失败状态结束。
- **实现**：使用 Bun/Node 内置的 `child_process`、`fetch` 与信号处理，不新增并发运行依赖。

### D17 追加 · preview 同样编排 Mock，且必须 `--mode prod`

- **日期**：2026-08-25
- **决策**：`bun run preview` 复用 Mock 编排；Vite 以 `--mode prod` 启动，与 `vite build --mode prod` 读同一组 env。子进程启动前去掉继承来的 `VITE_*`，避免 Bun 预加载的 `.env` 盖住 `.env.prod` / `.env.prod.local`。保留 `bun run preview:app` 作分步排障。
- **原因**：默认 `vite preview` 的 mode 是 `production` 不是 `prod`，base 会对不齐；Bun 预加载 `.env` 后，子路径 `.env.prod.local` 会被 `process.env` 盖掉，preview 把 `/admin/assets/*` 当成 SPA HTML。

### D18 · 主线 Tab 不持久化，route name 与 component name 显式分工

- **日期**：2026-08-24
- **决策**：R12 使用 route name 作为唯一 tab id，route meta 的 `componentName` 作为 KeepAlive include 名称；Home 固定且不可普通关闭。tabs 不写 storage，浏览器刷新后只从当前授权路由重建 Home 与当前页。
- **原因**：当前主线没有同一路由多 params 实例需求；提前使用 fullPath 作为无限多实例 id 会把 tab 唯一性和组件缓存唯一性混在一起。非持久化同时避免权限切换、路由删除和旧 query 造成过期 tab。
- **局部重载**：先把 active component name 临时移出 cache include，等待 KeepAlive prune，再卸载内容；恢复 include 后重新挂载。保持固定 route key，不使用随机 key 累积旧缓存实例，也不调用 `window.location.reload()`。
- **升级条件**：只有业务明确要求同一详情页同时打开多个 params/query 实例时，才把 tab id 升级为 name + params/query，并单独设计实例级缓存策略。

### D19 · app-store locale 是多库语言状态的唯一写入口

- **日期**：2026-08-24
- **决策**：支持 `zh-CN` / `en-US`；app store 持有唯一可变 locale，组件只调用 `setLocale/toggleLocale`。同步 watch 统一更新 Vue I18n、dayjs、`<html lang>` 和 `SOY_locale`，Naive UI 通过根 `NConfigProvider` 响应同一状态。
- **启动**：创建 i18n 前先校验 storage；app store 在 `setupStore` 阶段初始化并同步 locale，之后才完成 router、i18n plugin 和 mount。无效 storage 回退 `zh-CN` 并写回合法值。
- **路由投影**：RouteMeta、MenuItem、BreadcrumbItem 与 TabItem 保存 `i18nKey/labelKey`，组件渲染时翻译；fallback title/label 只用于缺 key 时兜底，不在切换语言时批量改写 store。
- **消息完整性**：英文消息使用中文消息形状的深层字符串类型约束；最终再做运行时 flatten 键集对比，不通过静默 fallback 掩盖缺键。

### D20 · theme store 持久化 scheme，darkMode 只做运行时派生

- **日期**：2026-08-24
- **决策**：持久化 `light/dark/auto` 原始选择与六位 hex 主色；`darkMode` 根据 scheme 和系统 media 计算，不把 auto 当时的布尔结果写回 storage。显式 light/dark 永远优先于系统变化。
- **首屏**：theme store 在 `setupStore` 阶段同步 DOM；此外 `index.html` head 在 CSS/应用脚本前预读合法 scheme 并设置 `html.dark/colorScheme`，避免已持久化 dark 首屏从亮色过渡。
- **颜色**：应用内纯函数只生成当前消费者需要的 primary default/hover/pressed/suppl，通过与白/黑的确定比例混色；同时写入 CSS vars 和 Naive common overrides。R19 锁输入输出，R20 再决定是否抽内部包。
- **重置**：reset 恢复 `light/#646cff` 并清除两个 theme storage key；locale、auth 和其他 storage 不受影响。非法 scheme/color 启动时回退并写回合法值。

### D21 · 登录失败保留当前表单值，但不持久化用户名或密码

- **日期**：2026-08-24
- **决策**：登录 model 只存在 Login 组件内存；错误凭证和网络失败后保留用户名与密码，便于用户修正/重试；成功离开页面或重新创建 Login 组件时自然销毁。主线不做 remember username，绝不写 password storage。
- **原因**：请求失败时清空密码会增加重试成本，而明文持久化会扩大泄露边界。当前本地 Mock 默认值仅用于学习演示，不改变“用户输入不持久化”的边界。
- **提交状态**：NForm 先完成 required 校验；auth store 的 `loading` 继续是实际登录请求的单一防重入状态，页面只投影为 NButton loading/disabled。页面不复制 token、request 或 redirect 逻辑。
- **错误呈现**：已知错误凭证映射为明确的双语消息，其他 backend/http/network 统一为可操作的网络/Mock 提示；原始 request error 仍由 auth/request 层保留，不把英文后端消息直接当 UI 文案。

### D22 · KeepAlive 切换保留 ECharts，真正 unmount 才 dispose

- **日期**：2026-08-24
- **决策**：Home 被 KeepAlive deactivated 时保留 ECharts instance 与页面局部状态，activated 后 nextTick resize；R12 局部重载、登出或 BaseLayout unmount 时 disconnect ResizeObserver、取消 rAF 并 dispose。
- **原因**：tab 往返频繁，保留实例可避免重复 init 与状态丢失；但真正卸载若不 dispose 会产生 observer/instance 泄漏。`getInstanceByDom` 作为同一容器的最后防重复边界。
- **尺寸**：以容器 ResizeObserver 为主，因为侧栏宽度过渡不触发 window resize；容器宽高为 0 时延后 init/resize。仅在浏览器缺少 ResizeObserver 时回退 window resize。
- **主题与语言**：不因 dark/locale/themeColor 改变而 re-init；计算 option 后 setOption 更新轴线、tooltip、legend、series 与星期文本，保持同一实例。
- **构建证据**：使用 ECharts core 按需注册后 Home 仍为 `722.90 kB / gzip 225.81 kB` 并触发 Vite 500kB warning。R16 不抬高 warning 阈值、不假装消除体积；R21 再评估 vendor/manual chunk、缓存与真实部署收益。

### D23 · wildcard 404 保留原 URL，模块 API 错误不跳全页 500

- **日期**：2026-08-24
- **路由**：提供显式 `/404` 便于手动访问，同时保留 wildcard 组件并维持用户原始 path/query/hash，不 replace 成 `/404`。这有利于调试与分享错误地址，也避免额外 redirect；403/404/500 均为 constant，不进 menu/tab。
- **恢复**：异常页 Home action 在 auth route 已注册时按 name 跳转；匿名冷启动尚无 home name 时改走 `/home`，让既有守卫安全转 login。Back/Retry 优先使用 Vue Router history state，无 back 时回 Home，不依赖 `window.history.length` 猜测。
- **500 边界**：全页 500 只用于页面级服务异常；普通 Dashboard request error 在模块内保留指标/图表，显示 NAlert 和 Retry。不会把所有 Axios/HTTP/backend error 粗暴重定向到 `/500`。
- **复用**：403/404/500 只提供 code、i18n key、illustration、actions 与 handler；共同 DOM、主题、响应式和可访问性全部由 ExceptionBase 负责。

### D24 · Oxlint 负责静态规则，Oxfmt 独占代码格式

- **日期**：2026-08-25
- **工具职责**：oxlint 启用 correctness/suspicious 与 TS/Vue/import 等结构规则；oxfmt 是唯一代码 formatter。当前不叠加 ESLint/Prettier，避免相同文件被两套规则反复改写。
- **命令契约**：`lint`/`format` 永远只检查；只有显式 `lint:fix`/`format:write` 才修改文件。`quality` 组合 typecheck、lint、format，不包含产品 build；R19 再加 test，R21 才把 build 纳入最终 CI 门。
- **范围**：R18 明确扫描 src、scripts、Vite/Uno 配置与必要 JSON；legacy/docs/dist/node_modules/coverage/.omx 不进入代码检查。R20 出现 packages 后再显式扩 scope，不用宽泛 `.` 把教学 Markdown 当源码。
- **本地 hook**：simple-git-hooks pre-commit 只执行 quality；失败后由开发者显式修复并重新 stage，不在 hook 中静默 write/fix，也不跑耗时产品 build。
- **CI**：GitHub Actions 固定 Bun 1.4.0，frozen install 后运行同一组脚本。R19 起本地 `quality` 含 test；CI 把 typecheck/lint/format、`bun run test` 与 `bun run build` 分成三步。pre-commit 仍不跑产品 build。

### D26 · 加分项留在 A 系列，不升格为主线

- **日期**：2026-08-25（R22）
- **明确不做（本仓库主线）**：动态路由、token 刷新单飞与重放、弹窗登出码、Elegant Router、多 layout、完整主题抽屉、页签拖拽、全局搜索、其它登录模块、iframe、SVG sprite、组件自动导入、多服务 baseURL、版本更新提示、全套 `@sa/*`、`@sa/scripts`。
- **原因**：必须项已覆盖后台内核；再加会把加分项升级成主线范围。
- **后续**：按 [04-learning-path.md](./04-learning-path.md) 的 A01–A10 另开进阶轮。
- **演示残留**：`/restricted`（`R_NOBODY`）保留为静态 403 演示页，页面标 `data-demo="static-permission"`，不是业务模块。

### D34 · A09 iframe 用同源演示，其它服务另绑 19008

- **日期**：2026-08-25（A09）
- **iframe**：`/iframe-page/:url?`。缺省加载 `public/iframe-demo.html`。param 只接受同源路径或 `http:`/`https:`，拒绝 `javascript:` / `data:` / `//`。vue-router 自己编码 param，调用方不要预编码。
- **其它服务**：`VITE_OTHER_SERVICE_BASE_URL` 是 JSON 对象，不装 json5。开发 `/proxy-demo` → `127.0.0.1:19008`；生产直连。同一 Mock 进程另听 19008，`GET /ping` 返回 `soybean-other-mock`。
- **白名单**：动态路由必须显式加入 `iframe-page`。生成器给带连字符的 view key 加引号。
- **不引入**：json5、外站 SDK、业务 CRUD。

### D33 · A08 登录模块用 URL 切换，微信只做演示

- **日期**：2026-08-25（A08）
- **决策**：同一 `login` 路由用可选 param `/login/:module(pwd-login|code-login|register|reset-pwd|bind-wechat)?` 切换五个模块。账密行为与 R15 相同。
- **验证码**：倒计时 60s；Mock `/auth/captcha` 固定演示码 `123456`。`13800138000` 登超管，`13900139000` 登普通用户。
- **注册/重置**：校验失败不发请求；成功回账密。Mock 不持久化用户表。
- **微信**：页面标明未接开放平台；「模拟扫码」走 `/auth/wechatLogin` 发超管 token。不装 JSSDK。
- **redirect**：模块切换保留 query；登录成功只接受站内、非 `//`、非 `/login` 前缀的 redirect。

### D32 · A07 命令盘只搜当前用户菜单

- **日期**：2026-08-25（A07）
- **决策**：全局搜索展平 `routeStore.menus` 叶子，不扫全部 vue-router 记录。普通用户因此搜不到 Restricted。
- **空关键字**：列出全部可搜项（命令盘）；输入后对标题/path/id 做包含匹配。
- **命令**：打开主题抽屉、切换亮暗。快捷键 `Ctrl/⌘+K` 自己绑在 `window`，不装 `@vueuse/core`。
- **开关**：`themeExtras.blocks.search`，默认开。

### D31 · A06 页签拖拽用原生 DnD，外观不拷 materials

- **日期**：2026-08-25（A06）
- **决策**：拖拽用 HTML5 DnD，不装 `vue-draggable-plus`（Sortable）。Chrome 外观是同一份 tab 数据的壳，不拷 `@sa/materials` CSS module。
- **顺序**：`reorderTabs` 之后固定 tab 重新靠左，不能把 Restricted 拖到 Home 前面。
- **持久化**：`globalTabs`；按当前路由名过滤；登出 `clearTabs` 必删。`tabCache` 默认开，可在抽屉关掉。
- **中键关闭**：默认开，固定 tab 不理中键。

### D30 · A05 主题抽屉只覆盖圆角、水印、预设、区块

- **日期**：2026-08-25（A05）
- **决策**：一份 `themeExtras` JSON 持久化 radius / grayscale / colourWeakness / watermark / blocks。抽屉是编辑器，不是第二套主题系统。
- **圆角**：`--theme-radius` + Naive `borderRadius`，范围 0–16。
- **水印**：`NWatermark`；用户名与时间互斥；时间用 dayjs + `setInterval`。
- **预设**：TS 内 4 个（default / dark / compact / azir），一次写入 scheme、色、layout mode、extras。
- **区块**：页签、面包屑、页脚开关；页脚默认关。不改 tab 拖拽、不导出 JSON。
- **不引入**：clipboard、`@vueuse/core`、preset JSON glob、全套 tokens。

### D29 · A04 六种 layout mode 只改壳，不扩菜单页

- **日期**：2026-08-25（A04）
- **决策**：实现 legacy 的 6 个 mode 名。菜单仍来自路由投影。当前只有一级 `home`/`restricted`，嵌套差异用单元测试夹具证明，不为 mix 加 CRUD 页。
- **壳**：vertical 保持 R05；horizontal 去掉 sider、菜单进顶栏；vertical-mix 用 90px 一级栏，有二级再开子列；两个 header-first 在无二级时隐藏 sider。
- **入口**：顶栏 `<select>`，写入 storage；重置主题回到 `vertical`。完整抽屉仍是 A05。
- **不引入**：`@sa/materials`、mixSiderFixed、页脚/水印开关。

### D28 · A03 用本地生成器，不装 `@elegant-router/vue`

- **日期**：2026-08-25（A03）
- **决策**：扫描 `src/views` 生成 Elegant 描述 + 手写 `layout.x$view.y` 变换。不安装 `@elegant-router/vue` 0.3.8。
- **原因**：官方插件依赖 Prettier 3 与 unplugin 1.x，和 D24（oxfmt 独占格式）冲突；`@elegant-router/types` 是生成的虚拟模块，不是 npm 包。
- **KeepAlive**：官方把每个一级页包进独立 layout 实例，切换 `/home` 与 `/restricted` 会卸掉 `BaseLayout` 里的缓存。本轮把同一 `layout.base` 的业务页收进一个 `root`。
- **覆盖**：文件名仍生成 `403`/`404`/`500`，vue-router name 覆盖为已有的 `forbidden` / `not-found-page` / `server-error`。
- **替代**：以后官方插件去掉 Prettier、对齐 Vite 8 时再评估直装。

### D27 · expired 码走单飞刷新，失败才登出

- **日期**：2026-08-25（A01）
- **决策**：`9999/9998/3333` 先 `refreshSession`（并发共用一个 Promise），成功后重放原请求一次；refresh 接口 `skipExpiredRefresh`。失败或没有 refresh token 才 `resetStore`。
- **原因**：主线把三种会话码都登出，会把「token 过期可恢复」和「会话作废」混在一起。
- **验证**：单元测试覆盖单飞/重放/失败；Chrome 模拟过期后 storage 换成 refreshed token 且不跳登录。
