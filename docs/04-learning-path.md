# 04 · 分轮学习路线

按顺序做。这份路线现为 **R00–R22，共 23 轮**。数量比初稿多，但业务范围没有扩大；新增轮次主要是拆开不同故障域，并补上自动化测试与生产演练。

## 轮次地图

| 轮 | 文档 | 你将得到 | 大约耗时 | 验收一句话 |
| --- | --- | --- | --- | --- |
| 0 | [R00-prep.md](./rounds/R00-prep.md) | Bun、Node、镜像、legacy 对照环境 | 30–60 分 | `bun -v` 可用，知道 legacy 如何对照 |
| 1 | [R01-scaffold.md](./rounds/R01-scaffold.md) | 根目录 Vite + Vue + TS 空应用 | 1–2 时 | dev 可打开，typecheck 为 0 |
| 2 | [R02-app-bootstrap.md](./rounds/R02-app-bootstrap.md) | main/App/plugin 启动链 | 1–2 时 | 启动顺序可复述，有首屏 loading |
| 3 | [R03-style.md](./rounds/R03-style.md) | UnoCSS + reset + CSS 变量 | 1–2 时 | 工具类生效，`html.dark` 可切 |
| 4 | [R04-router.md](./rounds/R04-router.md) | vue-router 5 手写路由 | 1–2 时 | login/home/404 可跳，history/hash 可验证 |
| 5 | [R05-layout.md](./rounds/R05-layout.md) | 侧栏 + 顶栏 + 内容骨架 | 2–3 时 | home 走 base，login 走 blank，手机不撑爆 |
| 6 | [R06-pinia.md](./rounds/R06-pinia.md) | Pinia setup store 与 `$reset` | 1–2 时 | app store 可用，五个 store 责任定义清楚 |
| 7 | [R07-env-mock.md](./rounds/R07-env-mock.md) | mode、env 类型、proxy、Mock 连通 | 1.5–2.5 时 | 不经 Axios 也能证明浏览器到 Mock 的链路 |
| 8 | [R08-request.md](./rounds/R08-request.md) | Axios flat request 与错误协议 | 2–3 时 | 成功/业务失败/网络失败都有稳定 `{ data, error }` |
| 9 | [R09-auth.md](./rounds/R09-auth.md) | 登录、会话恢复、登出 | 2–3 时 | token + userInfo 完整，刷新可恢复，登出清干净 |
| 10 | [R10-permission.md](./rounds/R10-permission.md) | 守卫决策树 + 静态权限路由 | 2–4 时 | 未登录跳 login，无权限 403，刷新不被 404 吃掉 |
| 11 | [R11-menu-breadcrumb.md](./rounds/R11-menu-breadcrumb.md) | 路由投影的菜单与面包屑 | 1.5–2.5 时 | 菜单只显示可见路由，面包屑跟随 URL |
| 12 | [R12-tabs-cache.md](./rounds/R12-tabs-cache.md) | 多页签、KeepAlive、局部重载 | 2–3 时 | 关 tab 回邻页，cache 同步移除，重载不刷浏览器 |
| 13 | [R13-i18n.md](./rounds/R13-i18n.md) | Vue/Naive/dayjs locale 同步 | 1.5–2.5 时 | 菜单、tab、组件文案与日期一起切中英 |
| 14 | [R14-theme.md](./rounds/R14-theme.md) | 暗黑、主题色、Naive theme overrides | 2–3 时 | CSS 与 Naive 同时切暗黑，主色有完整交互态 |
| 15 | [R15-login-page.md](./rounds/R15-login-page.md) | 可交付的账密登录页 | 2–3 时 | 校验/loading/错误/手机/中英/亮暗全部通过 |
| 16 | [R16-dashboard.md](./rounds/R16-dashboard.md) | 统计卡 + ECharts 看板 | 2–4 时 | 图表在 resize/tab/theme 变化后正常且无泄漏 |
| 17 | [R17-exceptions.md](./rounds/R17-exceptions.md) | 403/404/500 与可恢复边界状态 | 1–2 时 | 三页复用基座，路由不循环，用户有恢复动作 |
| 18 | [R18-tooling.md](./rounds/R18-tooling.md) | typecheck/lint/format/CI 质量门 | 1.5–3 时 | `bun run quality` 可重复运行，CI 用 frozen lockfile |
| 19 | [R19-testing.md](./rounds/R19-testing.md) | 核心逻辑与组件回归测试 | 2–4 时 | request/permission/menu/tabs/auth reset 契约有自动化证据 |
| 20 | [R20-packages.md](./rounds/R20-packages.md) | Bun workspace 与稳定基础包 | 2–3 时 | 测试锁定后再抽包，边界无 `@/store` 反向依赖 |
| 21 | [R21-production.md](./rounds/R21-production.md) | prod build/preview/base/fallback 演练 | 1.5–3 时 | 产物不依赖 dev proxy，根/子路径配置已演练 |
| 22 | [R22-final-acceptance.md](./rounds/R22-final-acceptance.md) | 对等清单、文档、知识验收 | 2–3 时 | 质量门 + prod 手工路径 + 必须清单全部有证据 |

## 依赖关系

```text
R00 → R01 → R02 → R03
                 ↓
                R04 → R05 → R06
                              ↓
                R07 → R08 → R09 → R10
                                      ↓
                R11 → R12 → R13 → R14
                                      ↓
                R15 → R16 → R17 → R18
                                      ↓
                R19 → R20 → R21 → R22
```

R03 与 R04 可小幅对调，R06 也可在 R05 前先建 store 空壳；其余主线建议不跳。特别是：

- R08 前先证明 R07 网络链路；
- R11/R12 只消费 R10 已过滤的路由；
- R15–R17 在 i18n/theme 完成后才做页面交付，避免二次重写；
- R19 先建立回归证据，R20 才抽已在应用内稳定运行的代码；
- R20 抽包后必须重跑 R19，R21/R22 才做交付声明。

## 阶段与总投入

| 阶段 | 轮次 | 建议有效时间 |
| --- | --- | --- |
| 工具与骨架 | R00–R03 | 3.5–7 小时 |
| 页面底座 | R04–R06 | 4–7 小时 |
| 数据与权限 | R07–R10 | 7.5–12.5 小时 |
| 导航与个性化 | R11–R14 | 7–10.5 小时 |
| 页面交付 | R15–R17 | 5–9 小时 |
| 工程与交付 | R18–R22 | 9–16 小时 |

合计约 **36–62.5 小时**。如果每天能保持 4–6 小时有效学习，多数人需要约 8–12 天；初次深挖权限或 KeepAlive 时可能更长。这不是产品团队人天估算；前提是每轮做验收和思考题，而不是直接复制 legacy。

## 每轮文档的固定结构

1. **学习目标** — 概念，不只是文件清单
2. **对照 legacy** — 读哪些文件
3. **动手步骤** — 命令、边界与关键代码
4. **验收** — 可勾选的行为证据
5. **常见坑**
6. **思考题**
7. **不要做** — 防止把后续轮次偷跑进来

## 学习时怎么用 legacy

推荐窗口布局：

- 左边：`legacy/src/...` 只读
- 右边：根目录新代码
- 浏览器：legacy 仍按原配置尝试 9527，新项目使用高位端口 19528

读代码顺序建议：**main → store → guard → request → 页面**。不要从某个 `.vue` 的样式开始。

## 完成后的自我检查

打开 [mapping/features.md](./mapping/features.md)，必须项全绿、R19 回归测试在 R20 抽包后仍全绿、R21 生产预览路径通过，才算主线结束。加分项可以留作后续，但必须如实记录。

## 为什么主线停在 R22

R00–R22 已满足三个停止条件：

1. `mapping/features.md` 的每个必须能力都有唯一主责轮次；
2. 环境、请求、会话、守卫、导航、缓存、locale、theme、图表与部署等主要故障域已分开；
3. 回归测试位于 workspace 重构之前，生产演练与最终验收也已分开。

再继续加主线轮次，就不再是「把必须项拆清」，而是「将加分项升级为主线范围」。这会破坏 [00-overview.md](./00-overview.md) 的非目标。

如果 R22 后仍想继续，用独立的 **A 系列进阶轮**，不让它们阻塞主线 done：

| 进阶轮 | 主题 | 对应加分项 |
| --- | --- | --- |
| A01 | [token 刷新单飞与请求重放](./rounds/A01-token-refresh.md) | expired token codes |
| A02 | [后端动态路由协议](./rounds/A02-dynamic-routes.md) | `VITE_AUTH_ROUTE_MODE=dynamic` |
| A03 | Elegant Router 与路由生成 | 文件即路由 |
| A04 | 多 layout mode | mix / hybrid / horizontal |
| A05 | 完整主题设置抽屉 | 圆角、水印、预设、区块开关 |
| A06 | 高级页签 | 拖拽、Chrome 外观、更完整持久化 |
| A07 | 全局搜索 | 命令盘与路由搜索 |
| A08 | 其他登录模块 | 验证码、注册、重置、微信 |
| A09 | iframe 与多服务请求 | iframe page、other service baseURL |
| A10 | 图标/插件自动化 | SVG sprite、组件自动导入、版本更新提示 |

进阶轮应在开始时再写自己的完整文档和验收；本路线只固定边界，不预先把可选实现写成假主线。
