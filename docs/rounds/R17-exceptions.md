# R17 · 内置异常页与边界状态

## 学习目标

- 用一个通用异常基座交付 403、404、500，不复制三份布局
- 将「无权限」「路由不存在」「服务异常」作为不同用户状态表达
- 验证 constant route、404 兜底和登录守卫在边界路径上不冲突
- 让异常页同时覆盖中英文、亮暗主题与手机宽度

## 对照 legacy

- `legacy/src/components/common/exception-base.vue`
- `legacy/src/views/_builtin/403/index.vue`
- `legacy/src/views/_builtin/404/index.vue`
- `legacy/src/views/_builtin/500/index.vue`
- `legacy/src/assets/svg-icon/no-permission.svg`
- `legacy/src/assets/svg-icon/not-found.svg`
- `legacy/src/assets/svg-icon/service-error.svg`
- `legacy/src/router/routes/builtin.ts`

## 动手步骤

### 1. 建立 ExceptionBase

最小 props：

- `code: 403 | 404 | 500`
- `titleKey`
- `descriptionKey`
- `illustration`
- `primaryAction`

403/404/500 页只选择配置，不重写相同 DOM。行为有差异时通过 slot 或回调表达，不在基座里硬编码所有路由判断。

### 2. 定义各状态的恢复动作

- 403：回首页，或返回上一个可访问页；
- 404：回首页，不自动循环重定向；
- 500：允许重试当前操作或回首页，不伪装成 404。

“返回上一页”必须有无 history 时的兜底，不能在新标签直达时失效。

### 3. 对齐路由与守卫

- `/403`、`/404`、`/500` 可直接打开；
- 未知 path 最终展示 404；
- 无权限业务页进 403，不被 not-found 抢先；
- 异常页不进业务菜单与 tab；
- 直达 404 不触发登录重定向死循环。

### 4. 处理视觉与可访问性

插图有 alt 或被标记为装饰；状态码、标题、描述和主操作的阅读顺序清晰。暗黑下不出现白底图块，360px 宽度下插图不撑开页面。

### 5. 补一个网络错误边界示例

不新建第四个必须路由；在 R16 的看板数据区演示「loading / success / error / empty」中至少一个 error 恢复动作，证明 request 错误不只存在控制台。

## 验收

- [x] 手动打开 `/403`、`/404`、`/500` 都能看到对应内容
- [x] 任意未知 path 进 404，不白屏、不重定向循环
- [x] 受限路由进 403，不误进 404
- [x] 三页复用同一个 ExceptionBase，只传差异配置
- [x] 主操作能回到可用页，新标签直达也有兜底
- [x] 中英、亮暗与 360px 宽度全部可用
- [x] 至少一个业务区能可见地展示网络错误并重试

R17 实际证据（2026-08-24）：

- 新增 `ExceptionBase`，统一状态码、title/description key、装饰插图、primary/secondary action、主题/语言控件；插图 `aria-hidden=true`，阅读顺序为 code→h1→description→actions；
- 403/404/500 页面只导入基座、选择 illustration/action key 并绑定 navigation handler；生产各页 chunk 约 `0.54–0.55 kB`，共享 navigation/base chunk；
- 新增显式 `/404`、`/500` constant route，wildcard `not-found` 仍保留。匿名手动打开 403/404/500 均直接显示，不被登录守卫抢走；
- 未知 `/does-not-exist/r17?x=1#abc` 与登录态 `/r17-unknown-logged?case=loop` 都保留原 URL 显示 404；完整刷新后仍是相同 URL/页面，没有 redirect loop；
- Regular `User` 登录后直达 `/restricted` 最终 URL/title 为 `/403 / Forbidden`，没有误入 wildcard 404；403 的 Go back 返回可访问 Home；
- 匿名新标签直达 403 首次点击 Home 暴露“home name 尚未注册”边界；修复为有 route name 则按 name，否则导航 `/home` 交给既有 guard 转 `login?redirect=/home`；500 新标签 Retry 同样有 Home fallback；
- 360×800 dark/en 500 实测 document scrollWidth=360，code/title/description/actions 可读，装饰不撑宽；中文亮色 403 桌面与英文暗色 500 手机截图通过；
- Dashboard mounted 后真实请求 `/health` 显示 success；点击 Simulate 调 `/test/http-500` 得到 HTTP 500，页面内 NAlert `role=alert` 显示 error，URL 仍 `/home` 且图表 ready；Retry 再调 `/health` 恢复 success；
- 模块请求错误没有跳全页 500、没有清空指标/图表；全页 500 只表达页面级服务异常，二者责任分离；
- Chrome 最终 Console/Issues 为空；frozen install/typecheck/build/102-key 中英键集/diff check 通过。R16 已知 Home chunk warning 仍保留到 R21。

## 常见坑

- **404 与 auth route 注册时机冲突**：合法业务路由首次直达被兜底吃掉。
- **403 也标为 requiresAuth**：守卫对 403 再次做权限判断，可能循环。
- **三页复制粘贴**：后续修主题或 i18n 时三处分叉。
- **只有状态码没有恢复动作**：用户知道错了，但无法继续。

## 思考题

1. 500 页是一个路由，还是每个数据模块都应有的 error state？两者如何分工？
2. 404 应该保留用户输入的原 URL 还是立即 replace 成 `/404`？这对调试与分享有什么影响？

## 不要做

- 不要把 403/404/500 加进菜单或多页签
- 不要用相同文案模糊三种状态
- 不要把所有 API 失败都导向全页 500
