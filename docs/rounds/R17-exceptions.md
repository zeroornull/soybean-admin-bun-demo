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

- [ ] 手动打开 `/403`、`/404`、`/500` 都能看到对应内容
- [ ] 任意未知 path 进 404，不白屏、不重定向循环
- [ ] 受限路由进 403，不误进 404
- [ ] 三页复用同一个 ExceptionBase，只传差异配置
- [ ] 主操作能回到可用页，新标签直达也有兜底
- [ ] 中英、亮暗与 360px 宽度全部可用
- [ ] 至少一个业务区能可见地展示网络错误并重试

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
