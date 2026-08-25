# A02 · 后端动态路由协议

主线仍默认 `VITE_AUTH_ROUTE_MODE=static`。本轮加上 `dynamic`：登录后向后端要当前用户的路由树，再 `addRoute`。

## 学习目标

- 分清 static（前端全量树 + roles 过滤）和 dynamic（后端已过滤的树）
- 后端 JSON 的 `component` 必须经 **白名单** 映射到真实 import，禁止拼接任意路径
- 动态模式下未知 path：若后端说路由存在则 403，否则 404
- 不引入 Elegant Router（那是 A03）

## 协议

`GET /route/getUserRoutes` 返回：

```ts
{
  home: 'home',
  routes: BackendRoute[]
}
```

`GET /route/isRouteExist?path=/restricted` 返回 boolean：系统里是否存在这条业务路由（与当前用户有没有权无关）。

## 验收

- [x] `static` 默认行为不变：超管见受限页，普通用户直达 `/restricted` 得 403
- [x] `dynamic` 下后端给超管 home+restricted，给普通用户只有 home
- [x] 未知 component key 被丢掉，不执行动态 import
- [x] 刷新后动态路由重新注册，不被 404 吃掉
- [x] `bun run quality` 通过

A02 实际证据（2026-08-25）：

- 默认 `.env` 仍是 `static`；`VITE_AUTH_ROUTE_MODE=dynamic` 时 `GET /route/getUserRoutes` + 白名单 `routeComponentMap`；
- 未知 `component` 被丢掉（测试覆盖 `../../etc/passwd`）；
- 动态 403 靠 `GET /route/isRouteExist`，未知 path 仍是 404；
- 28 tests 全绿；Chrome dynamic：超管菜单有受限页且刷新仍在；User 菜单无受限页，直达 `/restricted` → 403，`/totally-unknown` → 404。
