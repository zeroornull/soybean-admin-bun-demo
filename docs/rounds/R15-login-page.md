# R15 · 登录页交付

## 学习目标

- 把 R09 的最小登录表单收口为可演示页面
- 用 Naive UI 表单校验、loading 和错误反馈表达完整提交状态
- 使登录页同时适配桌面/手机、中英文和亮暗主题
- 保持页面只组织交互，不重写 auth store 的会话逻辑

## 对照 legacy

- `legacy/src/views/_builtin/login/index.vue`
- `legacy/src/views/_builtin/login/modules/pwd-login.vue`
- `legacy/src/hooks/common/form.ts`
- `legacy/src/hooks/business/auth.ts`
- `legacy/src/components/custom/wave-bg.vue`

## 本轮范围（必须）

1. 品牌/页面标题、用户名、密码、提交按钮；
2. 必填校验、Enter 提交、错误消息与 loading；
3. 中英文与亮暗主题；
4. 360px 左右宽度下可用，不横向溢出；
5. 不依赖 base-layout，冷启动可直接打开。

## 动手步骤

### 1. 用 Naive 表单替换草稿

`NForm` + `NFormItem` + `NInput` + `NButton`。表单数据留在页面，会话结果留在 auth store。

提交前先 `validate`；校验不通过不发请求。`@submit.prevent` 防止浏览器刷新。

### 2. 明确提交状态

- loading 时禁止重复提交；
- 后端业务错误显示用户可理解的消息；
- 网络错误不清空用户名，密码是否保留由你在 decisions 记录；
- 成功导航交给 R09/R10 已建立的逻辑。

### 3. 接入 i18n 与 theme

表单 label、placeholder、校验消息、按钮文案全部使用 R13 的 key。颜色消费 R14 的 CSS 变量或 Naive token，不在页面写另一套 dark 颜色常量。

### 4. 做最小响应式布局

桌面可用左侧品牌区 + 右侧表单，手机合并为单列。装饰图不能挤压表单或导致滚动条。

### 5. 补基础可访问性

- input 有可感知 label；
- Tab 顺序为用户名 → 密码 → 提交；
- 错误消息不只靠颜色；
- 按钮 loading 时仍有可理解文案或 aria 状态。

## 加分项

- 主题色背景与波浪装饰
- 密码显示/隐藏
- 记住用户名（不记住密码）

验证码、注册、重置密码、微信登录仍不进主线。

## 验收

- [x] 空表单不发请求，校验信息清晰
- [x] 错误凭证有可见反馈，正确凭证只发一次请求并进 home
- [x] 连续快速点击不会并发多次登录
- [x] Enter 可提交，不刷新页面
- [x] 中英文与亮暗主题完整覆盖页面
- [x] 360px 宽度可用，无横向溢出
- [x] Tab 键可按正确顺序完成登录

R15 实际证据（2026-08-24）：

- 登录草稿替换为 `NForm/NFormItem/NInput/NButton/NAlert/NCard`；model 只留页面，提交仍调用 `authStore.login`，redirect/guard/token 流程未改；
- 桌面为品牌渐变区 + 表单区，品牌区消费 R14 primary palette；小于 lg 隐藏品牌区并显示移动 logo。360×800 实测 card 320px、document/body scrollWidth 都为 360；
- 清空用户名/密码点击提交，NForm 显示双语 required feedback，Performance `/auth/login` 数量保持不变；
- 错误凭证实测 NAlert 含图标、标题和 `role=alert`，中文为“用户名或密码错误”，切英文后同一 alert 立即变为可理解英文；
- DevTools Offline 下正确表单显示双语通用网络/Mock 错误；用户名与 6 位密码仍在组件内存，localStorage 中无 pass/pwd key，页面也明确提示不持久化；
- 同一任务内调用登录按钮 12 次，`/auth/login` 只从 2 增至 3；auth store loading 防重入与 NButton disabled/loading 同时生效；
- 修正正确密码后在密码 input 按 Enter，`/auth/login` 只增加 1 次并进入 `/home`，Performance navigation entry 仍为 1，证明没有浏览器刷新；
- 首个 Tab 焦点是 `login-username`，后续依次 `login-password`、submit button；两个 NForm label 的原生 `for` 都能找到对应 id；
- 中文亮色、英文暗色桌面截图与中文亮色、英文暗色 360px 截图均通过；主题/语言控件位于表单后方 DOM，不抢占登录表单首个 Tab；
- Chrome 最终 Console/Issues 为空；frozen install、typecheck、build、消息键集和 diff check 通过。

## 常见坑

- **loading 只改按钮样式却不防重入**：同一账号同时发出多次登录。
- **组件里自己存 token**：破坏 R09 的单一会话入口。
- **只对桌面截图对齐**：手机下装饰层覆盖输入框。
- **错误文案硬编码中文**：R13 切英文后混杂。

## 思考题

1. 登录 loading 应属于页面、auth store 还是 request 层？不同选择会影响哪些复用场景？
2. 为什么应保留「最小登录数据流」与「最终登录 UI」两个不同轮次？

## 不要做

- 不要重写 auth / redirect / guard 逻辑
- 不要在主线加入其他登录模块
- 不要保存明文密码
