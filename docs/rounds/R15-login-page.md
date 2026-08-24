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

- [ ] 空表单不发请求，校验信息清晰
- [ ] 错误凭证有可见反馈，正确凭证只发一次请求并进 home
- [ ] 连续快速点击不会并发多次登录
- [ ] Enter 可提交，不刷新页面
- [ ] 中英文与亮暗主题完整覆盖页面
- [ ] 360px 宽度可用，无横向溢出
- [ ] Tab 键可按正确顺序完成登录

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
