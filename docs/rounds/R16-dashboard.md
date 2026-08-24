# R16 · 首页看板与 ECharts 生命周期

## 学习目标

- 把 home 从路由占位页收口为可演示看板
- 实现可复用的 ECharts init / resize / dispose 生命周期
- 处理 layout 尺寸变化、tab 切换、KeepAlive 激活和主题变化
- 用响应式网格组织卡片和图表，不照搬 legacy 所有模块

## 对照 legacy

- `legacy/src/views/home/index.vue`
- `legacy/src/views/home/modules/`
- `legacy/src/hooks/common/echarts.ts`
- `legacy/src/components/custom/count-to.vue`
- `legacy/src/layouts/modules/global-content/index.vue`

## 本轮范围（必须）

- 至少 2 张统计卡片；
- 至少 1 个真实 ECharts 图表；
- 卡片与图表在亮暗主题下可读；
- 侧栏折叠、窗口缩放、tab 重新激活后尺寸正确；
- 离开页面后无重复 instance 或 ResizeObserver 泄漏。

## 动手步骤

### 1. 安装 ECharts

```bash
bun add echarts
```

优先按需引入已使用的 chart / component / renderer；若学习阶段先全量引入，在 R21 用产物大小决定是否优化，不凭感觉拆。

### 2. 写 `useEcharts`

至少处理：

- mounted 后容器尺寸有效时 `init`；
- `ResizeObserver` 或窗口 resize 时 `resize`；
- `onBeforeUnmount` 时 disconnect + dispose；
- `onActivated` 时 resize；
- option 或主题 token 变化时更新。

容器宽度为 0 时不强行 init。页签隐藏与布局折叠都可能导致短暂 0 宽。

### 3. 用最小数据形成信息层级

卡片显示标题、主数值与辅助趋势；图表表达一个清晰问题。数据可以是本地 demo，但要与类型、图例和单位一致。

### 4. 响应式网格

桌面多列，平板减列，手机单列。内容区负责滚动，不让整个 base layout 因图表最小宽度被撑开。

### 5. 对齐主题

图表背景、轴线、文字、tooltip 与 series 颜色从 R14 主题状态推导。暗黑切换后可 `setOption`；若更换 ECharts theme 需 dispose/re-init，必须确保旧 instance 已释放。

## 验收

- [x] home 至少有 2 张统计卡与 1 张真实图表
- [x] 侧栏折叠/展开后图表自适应，不截断
- [x] 浏览器尺寸变化、tab 切走再切回、页面局部重载均不崩溃
- [x] 反复进出 home 不出现 ECharts duplicate instance 警告
- [x] 亮暗切换后轴线、tooltip 和数据都可读
- [x] 360px 宽度下单列显示，内容区无横向溢出
- [x] `bun run typecheck` 通过

R16 实际证据（2026-08-24）：

- 安装 `echarts@6.1.0`，使用 core + Line/Bar/Grid/Legend/Tooltip/Canvas 按需注册；Home 包含 4 张指标卡、访问折线 + 订单柱状双轴图和 4 个渠道进度；
- `useEcharts` 在非零容器 mounted 后 init，ResizeObserver + rAF 合并 resize，option 深度更新，activated resize，beforeUnmount disconnect/dispose；`getInstanceByDom` 防止同容器重复 init；
- 首次桌面 chart ready=true、1 个 canvas，容器/canvas 均 1053px；侧栏折叠后同一 id 宽度 1077px，展开回 1053px，canvas 始终只有 1 个；
- viewport 1000px 时图表宽 706px、渠道卡移到下一行，content scrollWidth=clientWidth=780；360px 时 chart/canvas 238px、4 张统计卡单列、document scrollWidth=360；
- ECharts media 在 maxWidth 420 时隐藏双轴 name、收紧 grid、x 轴隔项显示，窄屏图例/刻度不再拥挤；chart 容器有 `role=img` 与双语 aria-label；
- light/中文切换到 dark/英文后同一 chart id 更新标题、legend、星期、轴色与 tooltip；暗色 tooltip 背景/文字/边框为 `#1f2937/#e5e7eb/#4b5563`；
- 主色改 `#e11d48` 后同一实例更新 line/bar/legend，渠道进度也为 `rgb(225,29,72)`；无 dispose/re-init；
- Home→Restricted→Home 保持同一 ECharts id 与 refresh count；连续往返 5 次仍单 canvas。R12 局部重载后 id 变化且 count 归零，证明旧实例 dispose；登出/登录后再次生成新 id；
- Console 无 ECharts duplicate/disposed/resize 警告；DatePicker input 保留 id/name，chart aria 与 R12/R13/R14 回归控件继续可用；
- frozen install、typecheck、build、90-key 中英键集和 diff check 通过。生产 Home chunk `722.90 kB / gzip 225.81 kB` 触发 500kB 提示；当前已按需引入，不抬阈值掩盖，R21 结合 manual chunk/部署缓存再处理。

## 常见坑

- **在 `display:none` 容器 init**：宽高为 0，恢复可见后不自动正确。
- **只监听 window resize**：侧栏折叠不一定触发窗口尺寸变化。
- **忘记 dispose / disconnect**：反复进出页面后内存与监听器累积。
- **主题切换只改容器背景**：轴线与 tooltip 在暗黑下不可读。

## 思考题

1. 侧栏尺寸改变为什么 `ResizeObserver` 比只监听 window resize 更正确？
2. KeepAlive 的 deactivated 阶段应 dispose chart 还是保留 instance？两种策略如何权衡？

## 不要做

- 不要复制 legacy 首页所有模块
- 不要为了数字动画先引入大型组件库
- 不要把图表实例放全局 store
