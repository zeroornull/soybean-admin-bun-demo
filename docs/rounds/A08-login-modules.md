# A08 · 其他登录模块

R15 只交付了账密登录。本轮用 URL 模块切换补上验证码、注册、重置和微信演示，不接真实短信/微信 SDK。

## 学习目标

- 登录页是 **同一路由、多个模块**，用可选 param 切换
- 验证码有倒计时和 Mock 发送，不是真短信
- 注册/重置走 Mock 成功回账密模块，不扩用户表
- 微信模块必须标明演示，禁止假装已接开放平台

## 对照

- `legacy/src/views/_builtin/login/index.vue`
- `legacy/src/views/_builtin/login/modules/*`
- `legacy/src/hooks/business/captcha.ts`
- 路由 `/login/:module(pwd-login|code-login|register|reset-pwd|bind-wechat)?`

## 边界

- `pwd-login` 行为与 R15 相同（Soybean / User）
- 验证码登录：`13800138000` → 超管，`13900139000` → 普通用户，码固定 `123456`
- 注册/重置：校验通过后提示成功并回到账密
- 微信：演示二维码 +「模拟扫码」登超管
- 不装微信 JSSDK，不加记住我

## 验收

- [x] `/login` 与 `/login/pwd-login` 都是账密表单
- [x] 验证码倒计时内不能重发；正确手机+码可登录
- [x] 注册/重置校验失败不发请求；成功回账密
- [x] 微信页可见演示说明，模拟扫码进入首页
- [x] 模块切换保留 `redirect` query
- [x] `bun run quality` 通过
- [x] Chrome：账密仍可用；验证码登录 User；微信模拟扫码进超管

A08 实际证据（2026-08-25）：

- 同一 `login` 路由用可选 param 切五个模块；未装微信 SDK，Mock 不持久化用户；
- 79 tests 全绿；`bun run quality` + `bun run build` 通过；
- Chrome（`http://localhost:19528`）：`/login` 与 `/login/pwd-login` 均为账密；验证码 60s 倒计时按钮 disabled，`13900139000` + `123456` 进 User（菜单无受限页）；空注册/重置只出校验、无对应请求；填对后分别打 `/auth/register`、`/auth/resetPwd` 并回到账密且保留 `redirect`；微信页标明未接开放平台，模拟扫码进超管（菜单有受限页）；账密 Soybean 仍可登录。

## 不要做

- 不要接真实短信或微信开放平台
- 不要在 Mock 里做持久化用户库
- 不要改守卫决策树
