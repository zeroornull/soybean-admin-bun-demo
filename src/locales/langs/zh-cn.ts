export const zhCN = {
  common: {
    appName: 'Soybean Admin',
    language: '语言',
    switchLanguage: '切换语言',
    chinese: '中文',
    english: 'English',
    logout: '退出登录',
    verticalLayout: '垂直布局',
    expandSidebar: '展开侧栏',
    collapseSidebar: '折叠侧栏',
    openPages: '已打开页面',
    reloadCurrentTab: '重载当前页签',
    closeOtherTabs: '关闭其他页签',
    closeAllTabs: '关闭全部页签',
    closeTab: '关闭{label}',
    light: '亮色',
    dark: '暗色',
    localState: '局部状态：{count}',
    openLogin: '打开登录页',
    backHome: '返回首页',
    goBack: '返回上一页',
    retry: '重试'
  },
  route: {
    login: '登录',
    home: '首页',
    restricted: '受限页',
    forbidden: '无权限',
    notFound: '页面不存在',
    serverError: '服务异常'
  },
  login: {
    title: '登录',
    description: '使用本地 Mock 账号开始会话。',
    brandTagline: '专注于后台系统核心能力的 Bun + Vue 学习项目。',
    brandPointRoute: '静态权限与安全导航守卫',
    brandPointState: '可追踪的会话与状态生命周期',
    brandPointTheme: '响应式布局、语言与主题同步',
    userName: '用户名',
    userNamePlaceholder: '请输入用户名',
    userNameRequired: '请输入用户名',
    password: '密码',
    passwordPlaceholder: '请输入密码',
    passwordRequired: '请输入密码',
    signingIn: '登录中…',
    signIn: '登录',
    loginFailed: '登录失败',
    invalidCredentials: '用户名或密码错误，请检查后重试。',
    requestFailed: '暂时无法登录，请检查网络或本地 Mock 服务后重试。',
    openProtectedHome: '打开受保护的首页',
    demoAccounts: '本地 Mock 演示账号',
    superAccount: '超管：Soybean / 123456',
    regularAccount: '普通：User / 123456',
    passwordMemoryOnly: '密码仅保留在当前页面内存中，不会写入 storage。'
  },
  home: {
    title: '首页',
    description: '当前认证页面使用基础布局。',
    localeDemo: '多库语言同步',
    dateLabel: 'dayjs 月份与星期',
    datePickerLabel: 'Naive UI 日期选择器'
  },
  dashboard: {
    title: '运营概览',
    subtitle: '用本地演示数据观察访问、订单与渠道趋势。',
    reportDate: '报表日期',
    refreshData: '刷新数据（{count}）',
    totalVisits: '总访问量',
    orders: '订单数',
    conversionRate: '转化率',
    revenue: '成交金额',
    visitsTrend: '近 7 日访问与订单',
    visits: '访问量',
    orderSeries: '订单',
    visitsUnit: '次',
    ordersUnit: '单',
    versusLastWeek: '较上周 {trend}',
    channelShare: '流量渠道',
    organicSearch: '自然搜索',
    socialMedia: '社交媒体',
    directVisit: '直接访问',
    emailCampaign: '邮件活动',
    serviceReady: '本地数据服务已就绪：{service}',
    simulateServiceError: '模拟服务异常',
    loadingService: '正在检查本地数据服务…',
    serviceUnavailable: '数据服务暂时不可用',
    serviceErrorDescription: '看板数据请求失败，请检查网络或本地 Mock 服务后重试。',
    chartAriaLabel: '近七日访问量折线和订单量柱状组合图',
    monday: '周一',
    tuesday: '周二',
    wednesday: '周三',
    thursday: '周四',
    friday: '周五',
    saturday: '周六',
    sunday: '周日'
  },
  restricted: {
    title: '受限路由',
    description: '只有静态超管角色可以绕过该路由的 R_NOBODY 要求。'
  },
  theme: {
    light: '亮色',
    dark: '暗色',
    auto: '跟随系统',
    switchScheme: '切换主题模式，当前：{scheme}',
    themeColor: '主题色',
    reset: '重置主题',
    currentTheme: '当前主题：{scheme} · {color}',
    primaryAction: 'Naive 主按钮'
  },
  error: {
    forbidden: '无访问权限',
    forbiddenDescription: '当前账号没有访问该页面的权限。你可以返回上一页或回到首页。',
    notFound: '页面不存在',
    notFoundDescription: '没有找到你访问的地址。原始 URL 已保留，方便检查和分享问题。',
    serverError: '服务暂时不可用',
    serverErrorDescription: '页面服务遇到异常。请返回上一页重试当前操作，或回到首页继续使用。'
  }
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type MessageSchema = DeepString<typeof zhCN>;
