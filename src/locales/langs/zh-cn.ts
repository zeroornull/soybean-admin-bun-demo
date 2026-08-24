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
    backHome: '返回首页'
  },
  route: {
    login: '登录',
    home: '首页',
    restricted: '受限页',
    forbidden: '无权限',
    notFound: '页面不存在'
  },
  login: {
    title: '登录',
    description: '使用本地 Mock 账号开始会话。',
    userName: '用户名',
    password: '密码',
    signingIn: '登录中…',
    signIn: '登录',
    openProtectedHome: '打开受保护的首页'
  },
  home: {
    title: '首页',
    description: '当前认证页面使用基础布局。',
    localeDemo: '多库语言同步',
    dateLabel: 'dayjs 月份与星期',
    datePickerLabel: 'Naive UI 日期选择器'
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
    notFound: '页面不存在'
  }
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type MessageSchema = DeepString<typeof zhCN>;
