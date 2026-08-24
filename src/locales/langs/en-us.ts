import type { MessageSchema } from './zh-cn';

export const enUS = {
  common: {
    appName: 'Soybean Admin',
    language: 'Language',
    switchLanguage: 'Switch language',
    chinese: '中文',
    english: 'English',
    logout: 'Logout',
    verticalLayout: 'Vertical layout',
    expandSidebar: 'Expand sidebar',
    collapseSidebar: 'Collapse sidebar',
    openPages: 'Open pages',
    reloadCurrentTab: 'Reload current tab',
    closeOtherTabs: 'Close other tabs',
    closeAllTabs: 'Close all tabs',
    closeTab: 'Close {label}',
    light: 'Light',
    dark: 'Dark',
    localState: 'Local state: {count}',
    openLogin: 'Open login',
    backHome: 'Back home'
  },
  route: {
    login: 'Login',
    home: 'Home',
    restricted: 'Restricted',
    forbidden: 'Forbidden',
    notFound: 'Page not found'
  },
  login: {
    title: 'Login',
    description: 'Use the local Mock credentials to start a session.',
    userName: 'User name',
    password: 'Password',
    signingIn: 'Signing in…',
    signIn: 'Sign in',
    openProtectedHome: 'Open protected Home'
  },
  home: {
    title: 'Home',
    description: 'The authenticated page currently uses the base layout.',
    localeDemo: 'Multi-library locale sync',
    dateLabel: 'dayjs month and weekday',
    datePickerLabel: 'Naive UI date picker'
  },
  restricted: {
    title: 'Restricted route',
    description: "Only the static super role can bypass this route's R_NOBODY requirement."
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    auto: 'Follow system',
    switchScheme: 'Switch theme scheme, current: {scheme}',
    themeColor: 'Theme color',
    reset: 'Reset theme',
    currentTheme: 'Current theme: {scheme} · {color}',
    primaryAction: 'Naive primary button'
  },
  error: {
    forbidden: 'No permission',
    notFound: 'Page not found'
  }
} satisfies MessageSchema;
