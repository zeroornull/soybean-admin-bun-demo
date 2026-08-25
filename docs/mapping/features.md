# 功能对等清单

两列不要混用：

- **落地**：对应轮次已有代码，并且那一轮的验收（命令或 Chrome）已通过。见 [PROGRESS.md](../PROGRESS.md)。
- **终验**：R22 用生产 preview 按完整手工路径重新勾选。未勾不代表没实现。

加分项不做不影响主线结束。终验日 2026-08-25；加分项见 D26，留 A 系列。

## 必须

| 功能 | legacy 锚点 | 轮次 | 落地 | 终验 |
| --- | --- | --- | --- | --- |
| Bun 安装与启动 | `package.json` scripts | R00–R01 | ☑ | ☑ |
| Vite 开发 / 构建 / 预览 | `vite.config.ts` | R01/R21 | ☑ | ☑ |
| TypeScript 严格检查 | `vue-tsc` | R01/R18 | ☑ | ☑ |
| 首屏 loading | `src/plugins/loading.ts` | R02 | ☑ | ☑ |
| UnoCSS 工具类 | `uno.config.ts` | R03 | ☑ | ☑ |
| 亮暗 class 切换 | theme store + `html.dark` | R03/R14 | ☑ | ☑ |
| History 路由 | `src/router/index.ts` | R04 | ☑ | ☑ |
| 登录走 blank 布局 | blank-layout | R04/R05 | ☑ | ☑ |
| 业务走 base 布局（顶栏+侧栏+内容） | base-layout | R05 | ☑ | ☑ |
| Pinia setup store + `$reset` | `store/plugins` | R06 | ☑ | ☑ |
| Axios flat 请求 | `@sa/axios` + `service/request` | R08 | ☑ | ☑ |
| 代理 / mock baseURL | `.env.test` + `build/config/proxy.ts` | R07 | ☑ | ☑ |
| 账密登录数据流 | `views/_builtin/login` + auth store | R09 | ☑ | ☑ |
| token 持久化与刷新恢复 | `localStg` + getUserInfo | R09 | ☑ | ☑ |
| 登出清状态 | `resetStore` | R09 | ☑ | ☑ |
| 未登录访问业务页跳登录 | `guard/route.ts` | R10 | ☑ | ☑ |
| 已登录访问登录页跳首页 | 同上 | R10 | ☑ | ☑ |
| 无权限 403 | 同上 | R10/R17 | ☑ | ☑ |
| 404 | `_builtin/404` | R04/R17 | ☑ | ☑ |
| 500 | `_builtin/500` | R17 | ☑ | ☑ |
| 侧栏菜单来自路由 | `getGlobalMenusByAuthRoutes` | R11 | ☑ | ☑ |
| 面包屑跟随当前路由 | `getBreadcrumbsByRoute` | R11 | ☑ | ☑ |
| 多标签打开/关闭 | tab store | R12 | ☑ | ☑ |
| KeepAlive 与 tab 缓存一致 | global-content | R12 | ☑ | ☑ |
| 局部重载当前页 | app/tab store + global-content | R12 | ☑ | ☑ |
| 中英切换 | vue-i18n + Naive + dayjs | R13 | ☑ | ☑ |
| Naive 主题随暗黑变化 | `App.vue` NConfigProvider | R14 | ☑ | ☑ |
| 主题色影响主按钮全部交互态 | themeOverrides | R14 | ☑ | ☑ |
| 登录页完整表单 | pwd-login | R15 | ☑ | ☑ |
| 首页可演示且图表生命周期正确 | `views/home` + echarts hook | R16 | ☑ | ☑ |
| 核心页在 360px 宽度可用 | login/layout/home/exceptions | R15–R17 | ☑ | ☑ |
| typecheck/lint/format/CI 质量门 | scripts + workflow | R18 | ☑ | ☑ |
| request/permission/menu/tabs/auth reset 自动化回归 | Vitest | R19 | ☑ | ☑ |
| Bun workspace 子集边界正确，抽包后回归仍绿 | `packages/*` | R20 | ☑ | ☑ |
| 生产构建可预览，不依赖 dev proxy | `vite build --mode prod` | R21 | ☑ | ☑ |
| 必须清单、产品路径、文档与实际版本收口 | R22 最终验收 | R22 | ☑ | ☑ |

## 加分

| 功能 | 说明 | 状态 |
| --- | --- | --- |
| 动态路由（后端下发） | `VITE_AUTH_ROUTE_MODE=dynamic` | ☑ A02（默认仍 static） |
| token 刷新单飞与重放 | `EXPIRED_TOKEN_CODES` | ☑ A01 |
| 弹窗登出码 | `MODAL_LOGOUT_CODES` | ☐ |
| Elegant Router | 文件即路由 | ☑ A03（本地生成器，未装官方插件） |
| 6 种 layout mode | mix / hybrid | ☑ A04（壳投影，未装 materials） |
| 主题设置抽屉全量 | 圆角、水印、各块开关 | ☑ A05 |
| 页签拖拽、Chrome 风格页签 | 原生 DnD + 本地 chrome 壳（未装 materials） | ☑ A06 |
| 全局搜索命令盘 | `global-search` | ☐ |
| 验证码/注册/重置/微信登录 | login modules | ☐ |
| iframe 页 | `_builtin/iframe-page` | ☐ |
| 本地 SVG 图标雪碧图 | vite-plugin-svg-icons | ☐ |
| 组件自动导入 | unplugin-vue-components | ☐ |
| 多服务 baseURL | `VITE_OTHER_SERVICE_BASE_URL` | ☐ |
| 版本更新提示 | `plugins/app.ts` | ☐ |
| `@sa/*` workspace 全套 | R20 主线只要求稳定子集 | ☐ |
| git commit 规范 CLI | `@sa/scripts` | ☐ |

## 明确不做（默认）

- Alova 作为默认请求库
- 把 `legacy/` 提交进 git
- 换成 Element Plus / Ant Design Vue
- 1:1 复制 Soybean 官网演示里本仓库没有的页面
