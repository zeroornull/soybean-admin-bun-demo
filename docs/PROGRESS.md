# 进度

当前路线经重新核对后确定为 **R00–R22，共 23 轮**。

轮次的目的是隔离学习边界与失败原因，不是把同样的工作人为拖长。每完成一轮，才把状态改成 `done`，并记下日期与必要证据；不要提前勾选。

## 当前快照

核对日：**2026-08-25**（R22 终验完成，主线结束）。

| 项 | 现状 |
| --- | --- |
| 主线位置 | **R00–R22 全部 done**。进阶 **A01–A06 done**，下一可选 **A07** |
| 包形态 | Bun workspaces：`@sa/utils`、`@sa/color`、`@sa/axios`；应用组装 token/env/session |
| 运行时 | Bun 1.4.0、Node 22.23.2；默认 npm registry，无 `bunfig.toml` |
| 质量门 | frozen install + typecheck + lint + 70 tests + format + build 全绿；CI 含 test/build |
| 终验 | 生产 preview 完整手工路径 + 360px 通过；[features.md](./mapping/features.md) 必须项落地/终验均勾 |
| 请求 | 开发走 `/proxy-default`；生产直连 `http://127.0.0.1:19007` |
| 部署 | 默认 `VITE_BASE_URL=/`；SPA fallback 已写入 README |

主线已结束。进阶轮 **A01–A06 已完成**，下一可选轮为 A07 全局搜索。

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
| R19 | 自动化回归测试 | done | 2026-08-25 | Vitest 4.1.11 + jsdom 30.0.1 + VTU 2.4.11；request/permission/menu/tabs/auth reset + ExceptionBase；14 tests 全绿；超管规则改错即红、恢复后绿；quality/CI 已接入 test |
| R20 | Bun workspace 与内部包 | done | 2026-08-25 | `@sa/utils` / `@sa/color` / `@sa/axios`；workspace symlink；20 tests 全绿；登录与 dark 主题 Chrome 复验通过；D11 已填 |
| R21 | 生产构建与部署演练 | done | 2026-08-25 | prod env 直连 19007；根路径 preview 全路径；`/admin/` 演练后恢复 `/`；CI 含 build；D12 已填 |
| R22 | 功能对等与最终验收 | done | 2026-08-25 | features 必须项终验全勾；preview 桌面+360 路径通过；`/restricted` 标 demo；D26 记录加分项；六条数据流写入架构文档 |

状态只用：`pending` / `in-progress` / `done` / `skipped`。

`skipped` 必须在笔记里写清原因、影响和替代验证。主线必须轮次不应仅因「太难」被跳过。

## 必须能力落地

对照 [mapping/features.md](./mapping/features.md)。「落地」来自对应轮次的代码与验收证据；「终验」只在 R22 用生产 preview 复验后勾。

| 能力 | 轮次 | 落地 | 终验 |
| --- | --- | --- | --- |
| Bun 安装与启动 | R00–R01 | 是 | 是 |
| Vite 开发 / 构建 | R01 | 是 | 是 |
| Vite 生产 preview 与 base | R21 | 是 | 是 |
| TypeScript 严格检查 | R01/R18 | 是 | 是 |
| 启动链 / loading / UnoCSS / 布局 / 五 store | R02–R06 | 是 | 是 |
| Mock 连通 + Axios flat + 登录会话 | R07–R09 | 是 | 是 |
| 静态权限守卫 / 403 / 404 / 500 | R10/R17 | 是 | 是 |
| 菜单 / 面包屑 / 页签 / KeepAlive / 局部重载 | R11–R12 | 是 | 是 |
| i18n / 主题 / 登录页 / 看板 / 360px | R13–R17 | 是 | 是 |
| typecheck/lint/format/CI | R18 | 是 | 是 |
| request/permission/menu/tabs/auth reset 自动化回归 | R19 | 是 | 是 |
| Bun workspace 子集 + 抽包后回归仍绿 | R20 | 是 | 是 |
| 生产构建可预览、不依赖 dev proxy | R21 | 是 | 是 |
| 必须清单、文档与实际版本收口 | R22 | 是 | 是 |

加分项默认不阻塞主线。A01–A06 已做；其余仍走 A 系列。

## 进阶轮

| 轮 | 标题 | 状态 | 完成日 | 证据 / 笔记 |
| --- | --- | --- | --- | --- |
| A01 | token 刷新单飞与请求重放 | done | 2026-08-25 | `@sa/axios` 单飞 refresh + 一次重放；失败才登出；26 tests；Chrome 模拟过期后拿到 refreshed token |
| A02 | 后端动态路由协议 | done | 2026-08-25 | JSON→白名单组件；默认 static；dynamic 下超管/普通/刷新/403/404 Chrome 通过 |
| A03 | Elegant Router 与路由生成 | done | 2026-08-25 | 本地 glob 生成器 + `layout.x$view.y` 变换；未装官方插件；44 tests；Chrome 登录/403/404/KeepAlive |
| A04 | 多 layout mode | done | 2026-08-25 | 6 个 mode 壳 + 菜单投影；未装 materials；54 tests；Chrome vertical/horizontal/mix + 刷新/重置 + 360px |
| A05 | 完整主题设置抽屉 | done | 2026-08-25 | 抽屉四页；圆角/水印/预设/区块；61 tests；Chrome 开抽屉、紧凑预设、刷新、重置、360px |
| A06 | 高级页签 | done | 2026-08-25 | 原生拖拽 + chrome 外观 + globalTabs；70 tests；Chrome 刷新恢复/中键关闭/登出清空 |
| A07 | 全局搜索 | pending | | |
| A08 | 其他登录模块 | pending | | |
| A09 | iframe 与多服务请求 | pending | | |
| A10 | 图标/插件自动化 | pending | | |

## 下一轮入口

可选：A07 全局搜索（开始时再写轮次文档）。主线不再增加 R 编号。

## 剩余主线

| 轮 | 进入条件 | 完成时必须多出来的证据 |
| --- | --- | --- |
| R19 | R18 已 done | 已完成：14 tests、quality/CI 含 test |
| R20 | R19 全绿 | 已完成：三包 workspace、20 tests、D11 |
| R21 | R19 全绿，R20 已抽 | 已完成：preview 路径、`/admin/` 演练、D12、CI build |
| R22 | R00–R21 均为 done | 已完成：features 终验、preview 路径、D26、数据流收口 |

## 阶段门

| 阶段 | 轮次 | 进入下一阶段前必须证明 |
| --- | --- | --- |
| 工具与骨架 | R00–R03 | dev/typecheck 可运行，启动链和样式入口清楚 |
| 页面底座 | R04–R06 | 路由、布局、五类 store 责任不混淆 |
| 数据与权限 | R07–R10 | Mock、flat request、会话恢复、守卫决策树通过 |
| 导航与个性化 | R11–R14 | 菜单/面包屑/tab/cache/i18n/theme 使用同一组状态源 |
| 页面交付 | R15–R17 | 登录、看板、异常边界在桌面/手机、中英、亮暗下可用 |
| 工程与交付 | R18–R22 | workspace 边界、quality、test、prod preview、功能对等全部有证据 |

六个阶段门均已关闭。

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
| axios | 1.19.0（现为 `@sa/axios` 依赖） | R08 |
| naive-ui | 2.45.2 | R11 |
| vue-i18n | 11.4.9 | R13 |
| dayjs | 1.11.23 | R13 |
| echarts | 6.1.0 | R16 |
| oxlint | 1.80.0 | R18 |
| oxfmt | 0.65.0 | R18 |
| simple-git-hooks | 2.13.1 | R18 |
| vitest | 4.1.11 | R19 |
| jsdom | 30.0.1 | R19 |
| @vue/test-utils | 2.4.11 | R19 |

未安装、也不算主线缺口：`@vueuse/core`、`@iconify/vue`、`nprogress`、ESLint/Prettier。R18 已明确只用 oxlint + oxfmt。

```bash
bun -v
node -v
bun pm ls
# 其余以 package.json / bun.lock 的实际解析版本为准
```

## 决策填写

已拍板并写入 [decisions.md](./decisions.md)：D1–D31。D12 为 `VITE_BASE_URL=/`。A01 见 D27，A02 见 D10 追加，A03 见 D28，A04 见 D29，A05 见 D30，A06 见 D31。

## 已知边界（不是漏做的主线）

这些是已记录的范围选择，不是未完成的主线：

- **ECharts 体积**：Home 约 `724.32 kB / gzip 226.27 kB`，Vite 500kB warning 按 D22 保留，本轮不拆包。
- **会话码**：expired 码走 A01 单飞刷新；弹窗登出码仍未做。
- **权限**：默认 static；dynamic 见 A02。`/restricted`（`R_NOBODY`）保留为 403 演示页。
- **路由生成**：A03 用本地生成器，不装 `@elegant-router/vue`。
- **生产 API**：本地 preview 直连 `127.0.0.1:19007`；真实上线需改 `.env.prod`，不要把 Mock 主机带上线。
- **布局 / 主题**：A04 六种 layout mode；A05 主题抽屉；A06 页签拖拽/Chrome 外观/持久化。全局搜索仍是 A07。
- **本地产物**：`dist/`、`legacy/`、`node_modules/` 均 gitignore；`legacy/` 只作对照。
