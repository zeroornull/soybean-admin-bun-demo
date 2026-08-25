# 进度

当前路线经重新核对后确定为 **R00–R22，共 23 轮**。

轮次的目的是隔离学习边界与失败原因，不是把同样的工作人为拖长。每完成一轮，才把状态改成 `done`，并记下日期与必要证据；不要提前勾选。

## 当前快照

核对日：**2026-08-25**。仓库 HEAD `f72e054`（R18 质量门）。

| 项 | 现状 |
| --- | --- |
| 主线位置 | **R00–R18 已完成（19/23）**，下一轮 **R19 自动化回归测试** |
| 包形态 | 单包；无 `packages/`，无 Vitest / `test` 脚本 |
| 运行时 | Bun 1.4.0、Node 22.23.2；默认 npm registry，无 `bunfig.toml` |
| 质量门 | `bun run quality` 本轮复核通过：typecheck 0、oxlint 53 files / 0 issues、oxfmt 61 files |
| CI | `.github/workflows/quality.yml`：Bun 1.4.0 + frozen install + quality；**尚未**含 test / build |
| 应用内核 | 登录会话、静态权限守卫、菜单/面包屑/页签/KeepAlive、i18n、主题、登录页、看板、403/404/500 已在对应轮次用 Chrome 验收 |
| 请求 | Axios flat union；dev 走 `/proxy-default` → 本地 Mock `127.0.0.1:19007`；prod env 仍占位 `19008` 且关闭 proxy |
| 路由 | 手写 vue-router 5；`VITE_AUTH_ROUTE_MODE=static`；无 Elegant Router、无后端动态路由 |
| 功能清单 | [mapping/features.md](./mapping/features.md) 已标出「落地 / 终验」：R00–R18 能力已落地，终验列留给 R22 |

不要把「代码在、quality 绿」写成 R19–R22 完成。那四轮分别缺测试、workspace、生产演练和终验勾选。

## 轮次重核结论

原 R00–R15 的大方向正确，但有 6 个轮次同时承担多个独立故障域，且没有自动化回归：

| 原轮次 | 问题 | 重核后 |
| --- | --- | --- |
| R07 HTTP | env、proxy、Axios、业务码、token 失效混在一起 | R07 连通性 + R08 请求协议 |
| R10 菜单与页签 | 路由投影与 KeepAlive 生命周期是两类问题 | R11 菜单/面包屑 + R12 页签/缓存 |
| R11 主题与 i18n | 语言同步与视觉 token 可独立失败 | R13 i18n + R14 theme |
| R12 业务页 | 登录表单、ECharts、异常路由同时交付过载 | R15 登录 + R16 看板 + R17 异常边界 |
| R14 工程化 | 只有 lint/typecheck，没有行为回归 | R18 工程化 + R19 自动化测试 |
| R15 收尾 | 生产环境、部署 base、功能对等和文档收口过载 | R21 生产演练 + R22 最终验收 |

权限守卫保留为独立 R10，动态路由仍是加分项；没有借拆轮扩展新业务范围。

R22 之后若继续 token 刷新、动态/Elegant Router、多布局、主题抽屉等加分项，改走 [04-learning-path.md](./04-learning-path.md) 里的 A 系列进阶轮，不继续增加主线 R 编号。

## 轮次状态

| 轮 | 标题 | 状态 | 完成日 | 证据 / 笔记 |
| --- | --- | --- | --- | --- |
| R00 | 环境准备 | done | 2026-08-24 | Node 22.23.2、Bun 1.4.0、pnpm 11.21.0；legacy frozen install + Vite HTTP 200 + typecheck 通过；使用默认 npm registry，不建 `bunfig.toml` |
| R01 | 脚手架 | done | 2026-08-24 | 手工创建 Vite + Vue + TS6 最小应用；`bun.lock`、typecheck、build 与 dev HTTP 烟雾全通过；D14/D15 后 dev/preview 改为高位起点 19528/19726，允许自动递增 |
| R02 | 应用启动链 | done | 2026-08-24 | assets/reset/loading/plugins 与异步 `setupApp` 已建立；isolated loading + headless Chrome mount 替换 + typecheck/build 全通过；已在高位端口复验 |
| R03 | 样式系统 | done | 2026-08-24 | UnoCSS 66.8.1 + reset/global/CSS 变量 + `html.dark` 已接入；build CSS 规则与 Chrome Dark/Light 计算样式全验证 |
| R04 | 路由基础 | done | 2026-08-24 | vue-router 5.2.0 + history/hash + base/blank 父子 RouterView + Home/Login/404 已落地；两种模式真实 Chrome 全路径通过 |
| R05 | 布局骨架 | done | 2026-08-24 | header/sider/content vertical shell + 本地 220/64px 折叠 + Home/Login 硬编码导航已落地；桌面/blank/360px 真实 Chrome 全通过 |
| R06 | Pinia 状态基座 | done | 2026-08-24 | Pinia 4.0.3 + devtools peer + 五 setup store + 受限 `$reset` 已落地；侧栏跨路由保留与五 store 双次 reset 真实 Chrome 全通过 |
| R07 | 环境变量、代理与 Mock | done | 2026-08-24 | strict env + test/prod loadEnv + `/proxy-default` rewrite + 本地 19007 Mock 已落地；curl/Chrome direct+proxy correct/wrong/CORS 全通过 |
| R08 | HTTP 请求核心 | done | 2026-08-24 | Axios 1.19.0 flat union + token header + backend/http/network/cancelled 分类 + auth API + 会话码回调已落地；Chrome 全契约通过 |
| R09 | 登录、会话恢复与登出 | done | 2026-08-24 | auth-store 登录链 + 双 token storage + userInfo + initSession 单飞 + 会话码 reset + Header Logout 已落地；Chrome 全流程通过 |
| R10 | 导航守卫与静态权限 | done | 2026-08-24 | constant/auth 拆分 + roles 过滤 + add/remove + initSession/rematch/redirect/403/404 守卫已落地；匿名/超管/普通/刷新/切号 Chrome 矩阵全通过 |
| R11 | 路由菜单与面包屑 | done | 2026-08-24 | Naive UI NMenu + filtered routes 菜单投影 + route.matched 面包屑 + name 选中态已落地；超管/普通/切号/刷新/前进后退 Chrome 矩阵通过 |
| R12 | 多页签、缓存与重载 | done | 2026-08-24 | route-name tabs + pinned Home + component-name KeepAlive + prune/unmount/remount 局部重载已落地；切换/关闭/刷新/登出 Chrome 矩阵通过 |
| R13 | 国际化与 locale 同步 | done | 2026-08-24 | Vue I18n + app locale + Naive/date locale + dayjs + html lang/storage 已同步；中英全投影、冷启动、无效值回退 Chrome 矩阵通过 |
| R14 | 暗黑与主题色 | done | 2026-08-24 | light/dark/auto + system media + CSS/Naive palette + pre-mount storage + reset 已落地；暗色弹层/主色/冷启动/移动端 Chrome 矩阵通过 |
| R15 | 登录页交付 | done | 2026-08-24 | Naive Form + 双栏品牌页 + 校验/loading/NAlert/Enter/Tab/防重入已落地；错误/正确/离线/中英/亮暗/360px Chrome 矩阵通过 |
| R16 | 首页看板与 ECharts | done | 2026-08-24 | 4 指标卡 + ECharts 双轴趋势 + 渠道卡 + ResizeObserver/KeepAlive/dispose 生命周期已落地；resize/tab/reload/theme/360px Chrome 矩阵通过 |
| R17 | 内置异常页与边界状态 | done | 2026-08-24 | 共享 ExceptionBase + 显式 403/404/500 + wildcard 原 URL + history/home fallback + Dashboard HTTP error/retry 已落地；边界 Chrome 矩阵通过 |
| R18 | 工程化质量门 | done | 2026-08-25 | oxlint/oxfmt check+fix 分离 + stable quality + EditorConfig/Oxc VS Code + pre-commit + Bun frozen CI 已落地；连续 quality/hash/hook/build 验证通过 |
| R19 | 自动化回归测试 | pending | | 无 `vitest`、无测试文件、quality/CI 尚未跑 test |
| R20 | Bun workspace 与内部包 | pending | | 无 `packages/`；storage/color/axios 工厂仍在 `src/` |
| R21 | 生产构建与部署演练 | pending | | `build` 命令存在，但未做 prod preview / 子路径 / D12；CI 未纳入 build |
| R22 | 功能对等与最终验收 | pending | | 终验列未勾；`R_NOBODY` 演示页与 19008 占位仍在 |

状态只用：`pending` / `in-progress` / `done` / `skipped`。

`skipped` 必须在笔记里写清原因、影响和替代验证。主线必须轮次不应仅因「太难」被跳过。

## 必须能力落地

对照 [mapping/features.md](./mapping/features.md)。「落地」来自对应轮次的代码与验收证据；「终验」只在 R22 用生产 preview 复验后勾。

| 能力 | 轮次 | 落地 | 终验 |
| --- | --- | --- | --- |
| Bun 安装与启动 | R00–R01 | 是 | 待 R22 |
| Vite 开发 / 构建 | R01 | 是 | 待 R21/R22 |
| Vite 生产 preview 与 base | R21 | 否 | 待 R21/R22 |
| TypeScript 严格检查 | R01/R18 | 是 | 待 R22 |
| 启动链 / loading / UnoCSS / 布局 / 五 store | R02–R06 | 是 | 待 R22 |
| Mock 连通 + Axios flat + 登录会话 | R07–R09 | 是 | 待 R22 |
| 静态权限守卫 / 403 / 404 / 500 | R10/R17 | 是 | 待 R22 |
| 菜单 / 面包屑 / 页签 / KeepAlive / 局部重载 | R11–R12 | 是 | 待 R22 |
| i18n / 主题 / 登录页 / 看板 / 360px | R13–R17 | 是 | 待 R22 |
| typecheck/lint/format/CI | R18 | 是 | 待 R22 |
| request/permission/menu/tabs/auth reset 自动化回归 | R19 | 否 | 待 R19/R22 |
| Bun workspace 子集 + 抽包后回归仍绿 | R20 | 否 | 待 R20/R22 |
| 生产构建可预览、不依赖 dev proxy | R21 | 否 | 待 R21/R22 |
| 必须清单、文档与实际版本收口 | R22 | 否 | 待 R22 |

加分项（动态路由、token 刷新、Elegant Router、多布局、主题抽屉等）全部未做，不阻塞主线；R22 后走 A 系列。

## 下一轮入口：R19

文档：[rounds/R19-testing.md](./rounds/R19-testing.md)

前置已满足：R08–R13 的关键计算已有可测纯函数/工厂（`createFlatRequest`、`filterAuthRoutesByRoles`、`getMenusByAuthRoutes`、`getTabByRoute`、auth reset），不必先加测试专用开关。

本轮必须交付：

1. 安装最小工具：`vitest`、`jsdom`；组件测试再加 `@vue/test-utils`。不要同时引入 Playwright/Cypress。
2. `bun run test` = `vitest run`（一次退出，不进 watch）。
3. 五组契约至少一个有效断言：request、permission、menu、tabs、auth reset。
4. 登录表单或 ExceptionBase 二选一做交互测试。
5. `quality` 与 CI 接入 test；失败必须能单独定位。测试不打真实 Mock、不依赖本机 storage/当前时间。
6. 把 vitest / jsdom / `@vue/test-utils` 的实际解析版本补进本文件版本表。

R19 完成前不要开始 R20 抽包。

## 剩余主线

| 轮 | 进入条件 | 完成时必须多出来的证据 |
| --- | --- | --- |
| R19 | R18 已 done（已满足） | `bun run test` 退出 0；CI 含 test；五组契约 + 1 个组件测试 |
| R20 | R19 全绿 | `package.json#workspaces` + 稳定 `@sa/*` 子集；抽包后重跑 R19；lint/format 覆盖 `packages/`；D11 填包列表 |
| R21 | R19 全绿，R20 已抽或明确不抽 | prod build + preview 手工路径；根路径与一个子路径；不依赖 `/proxy-default`；D12 填 `VITE_BASE_URL`；CI 加 build |
| R22 | R00–R21 均为 done 或有合理 skipped | features 终验全勾；清理演示/占位；README 收口启动/测试/部署；能讲清六条数据流 |

## 阶段门

| 阶段 | 轮次 | 进入下一阶段前必须证明 |
| --- | --- | --- |
| 工具与骨架 | R00–R03 | dev/typecheck 可运行，启动链和样式入口清楚 |
| 页面底座 | R04–R06 | 路由、布局、五类 store 责任不混淆 |
| 数据与权限 | R07–R10 | Mock、flat request、会话恢复、守卫决策树通过 |
| 导航与个性化 | R11–R14 | 菜单/面包屑/tab/cache/i18n/theme 使用同一组状态源 |
| 页面交付 | R15–R17 | 登录、看板、异常边界在桌面/手机、中英、亮暗下可用 |
| 工程与交付 | R18–R22 | workspace 边界、quality、test、prod preview、功能对等全部有证据 |

前五段已关闭。工程与交付段只完成了 R18。

## 实际安装版本

R01 之后开始填，后续新增关键依赖时及时补齐，不等 R22 凭回忆抄。核对日 2026-08-25，以 `bun pm ls` / `bun.lock` 解析版本为准。

| 包 | 版本 | 首次出现 |
| --- | --- | --- |
| bun | 1.4.0 | R00 |
| node | 22.23.2 | R00 |
| vue | 3.5.41 | R01 |
| typescript | 6.0.3 | R01 |
| vite | 8.2.2 | R01 |
| @vitejs/plugin-vue | 6.0.8 | R01 |
| vue-tsc | 3.3.11 | R01 |
| @types/node | 26.2.0 | R01 |
| unocss | 66.8.1 | R03 |
| vue-router | 5.2.0 | R04 |
| pinia | 4.0.3 | R06 |
| @vue/devtools-api | 8.2.1 | R06 |
| axios | 1.19.0 | R08 |
| naive-ui | 2.45.2 | R11 |
| vue-i18n | 11.4.9 | R13 |
| dayjs | 1.11.23 | R13 |
| echarts | 6.1.0 | R16 |
| oxlint | 1.80.0 | R18 |
| oxfmt | 0.65.0 | R18 |
| simple-git-hooks | 2.13.1 | R18 |
| vitest | | R19 |
| jsdom | | R19 |
| @vue/test-utils | | R19 |

未安装、也不算主线缺口：`@vueuse/core`、`@iconify/vue`、`nprogress`、ESLint/Prettier。R18 已明确只用 oxlint + oxfmt。

```bash
bun -v
node -v
bun pm ls
# 其余以 package.json / bun.lock 的实际解析版本为准
```

## 决策填写

已拍板并写入 [decisions.md](./decisions.md)：D1–D8、D9（Pinia 4）、D10（主线不做动态路由）、D13–D24。

仍待对应轮次填最终值：

| 编号 | 主题 | 当前事实 | 何时填最终值 |
| --- | --- | --- | --- |
| D11 | 抽出哪些 `@sa/*` | 尚未抽包；候选在 `src/utils`、`src/utils/color.ts`、`src/service/request` | R20 |
| D12 | 部署 public path | `.env` 里 `VITE_BASE_URL=/`；未做子路径演练 | R21 |

## 已知边界（不是漏做的主线）

这些是已记录的范围选择或留给后续轮次的残留，不要在 R19 里顺手扩成新需求：

- **ECharts 体积**：Home 约 `722.90 kB / gzip 225.81 kB`，Vite 500kB warning 按 D22 保留，R21 再评估拆包。
- **会话码**：logout / modal logout / expired token 目前都走 `resetStore`；无单飞刷新与请求重放（A01）。
- **权限**：静态 `authRoutes` + `R_SUPER`；`/restricted` 使用 `R_NOBODY` 作为 403 演示页，R22 再决定删除或标明 demo。
- **生产 API**：`.env.prod` 的 `127.0.0.1:19008` 只是占位，不是最终部署地址（D16）。
- **布局 / 主题**：仅 vertical shell；无 mix/hybrid、无完整主题抽屉。
- **本地产物**：`dist/`、`legacy/`、`node_modules/` 均 gitignore；`legacy/` 只作对照。
