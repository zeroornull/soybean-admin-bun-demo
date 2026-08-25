# A09 · iframe 与多服务请求

主线只有一个 Mock 和一个 `/proxy-default`。本轮补上外链 iframe 页，以及第二个服务的 baseURL / 代理前缀。

## 学习目标

- iframe 是布局里的内容区，URL 来自路由 param，不是随便 `window.open`
- 其它服务有自己的 baseURL；开发走 `/proxy-demo`，生产直连
- `VITE_OTHER_SERVICE_BASE_URL` 是 JSON 对象，不引入 json5
- 动态路由白名单要显式加入 `iframe-page`，生成器不能把它写成非法标识符

## 对照

- `legacy/src/views/_builtin/iframe-page/[url].vue`
- `legacy/src/utils/service.ts` 的 `getServiceBaseURL`
- `legacy/.env.test` 的 `VITE_OTHER_SERVICE_BASE_URL`

## 边界

- 默认 iframe 源是同源 `public/iframe-demo.html`，避免外站 `X-Frame-Options` 把验收卡死
- param 只接受同源路径（`/` 且不是 `//`）或 `http:` / `https:`；拒绝 `javascript:` / `data:`
- 其它服务：同一 Mock 进程另绑 `127.0.0.1:19008`，`GET /ping` 返回 `soybean-other-mock`
- 不装 json5，不接真实第三方站点 SDK，不加业务 CRUD

## 验收

- [x] 菜单可打开外链页；默认加载同源演示 HTML
- [x] 编码后的 `/iframe-page/:url` 仍加载同一演示页
- [x] 非法 URL 不渲染 iframe
- [x] 开发请求其它服务走 `/proxy-demo/ping`，与 `/proxy-default` 不是同一前缀
- [x] `bun run quality` 通过
- [x] Chrome：超管打开外链页可见 iframe 正文；首页能看到其它服务就绪

A09 实际证据（2026-08-25）：

- 未装 json5；`VITE_OTHER_SERVICE_BASE_URL={"demo":"http://127.0.0.1:19008"}`；生成器给带连字符的 view key 加引号；
- 85 tests 全绿；`bun run quality` + `bun run build` 通过；
- Chrome（`http://localhost:19528`）：超管菜单有外链/受限；`/proxy-default/health` 与 `/proxy-demo/ping` 均为 200，首页显示 `soybean-other-mock`；`/iframe-page` 与 `/iframe-page/%2Fiframe-demo.html` 都能看到同源演示正文；`javascript:alert(1)` 只出警告、不渲染 iframe；User 菜单有外链、无受限页。

## 不要做

- 不要安装 json5 / 微信或其它开放平台 SDK
- 不要把 iframe 默认源指到会拒绝嵌入的外站
- 不要改守卫决策树
