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
    backHome: 'Back home',
    goBack: 'Go back',
    retry: 'Retry'
  },
  route: {
    login: 'Login',
    home: 'Home',
    restricted: 'Restricted',
    forbidden: 'Forbidden',
    notFound: 'Page not found',
    serverError: 'Service error'
  },
  login: {
    title: 'Login',
    description: 'Use the local Mock credentials to start a session.',
    brandTagline: 'A Bun + Vue learning project focused on the core of admin applications.',
    brandPointRoute: 'Static permissions and safe navigation guards',
    brandPointState: 'Traceable session and state lifecycles',
    brandPointTheme: 'Responsive layout, locale, and theme synchronization',
    userName: 'User name',
    userNamePlaceholder: 'Enter your user name',
    userNameRequired: 'User name is required',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    passwordRequired: 'Password is required',
    signingIn: 'Signing in…',
    signIn: 'Sign in',
    loginFailed: 'Unable to sign in',
    invalidCredentials: 'The user name or password is incorrect. Check both fields and try again.',
    requestFailed: 'Sign-in is temporarily unavailable. Check the network or local Mock service and try again.',
    openProtectedHome: 'Open protected Home',
    demoAccounts: 'Local Mock demo accounts',
    superAccount: 'Super: Soybean / 123456',
    regularAccount: 'Regular: User / 123456',
    passwordMemoryOnly: 'The password stays only in this page memory and is never written to storage.'
  },
  home: {
    title: 'Home',
    description: 'The authenticated page currently uses the base layout.',
    localeDemo: 'Multi-library locale sync',
    dateLabel: 'dayjs month and weekday',
    datePickerLabel: 'Naive UI date picker'
  },
  dashboard: {
    title: 'Operations overview',
    subtitle: 'Explore visits, orders, and acquisition trends with local demo data.',
    reportDate: 'Report date',
    refreshData: 'Refresh data ({count})',
    totalVisits: 'Total visits',
    orders: 'Orders',
    conversionRate: 'Conversion rate',
    revenue: 'Revenue',
    visitsTrend: 'Visits and orders · last 7 days',
    visits: 'Visits',
    orderSeries: 'Orders',
    visitsUnit: 'visits',
    ordersUnit: 'orders',
    versusLastWeek: '{trend} vs last week',
    channelShare: 'Traffic channels',
    organicSearch: 'Organic search',
    socialMedia: 'Social media',
    directVisit: 'Direct',
    emailCampaign: 'Email campaigns',
    serviceReady: 'Local data service is ready: {service}',
    simulateServiceError: 'Simulate service error',
    simulateExpiredToken: 'Simulate expired token',
    loadingService: 'Checking the local data service…',
    serviceUnavailable: 'Data service is temporarily unavailable',
    serviceErrorDescription: 'The dashboard request failed. Check the network or local Mock service and try again.',
    chartAriaLabel: 'Combined line and bar chart of visits and orders over the last seven days',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  },
  restricted: {
    title: 'Restricted route',
    description: "Only the static super role can bypass this route's R_NOBODY requirement.",
    demoNote: 'Demo page for static 403 checks, not a business module.'
  },
  layout: {
    switchMode: 'Switch layout mode',
    subMenu: 'Submenu',
    mode: {
      vertical: 'Vertical',
      'vertical-mix': 'Vertical mix',
      'vertical-hybrid-header-first': 'Left hybrid, header first',
      horizontal: 'Horizontal',
      'top-hybrid-sidebar-first': 'Top hybrid, sidebar first',
      'top-hybrid-header-first': 'Top hybrid, header first'
    }
  },
  theme: {
    light: 'Light',
    dark: 'Dark',
    auto: 'Follow system',
    switchScheme: 'Switch theme scheme, current: {scheme}',
    themeColor: 'Theme color',
    reset: 'Reset theme',
    currentTheme: 'Current theme: {scheme} · {color}',
    primaryAction: 'Naive primary button',
    drawerTitle: 'Theme settings',
    openDrawer: 'Open theme settings',
    radius: 'Radius',
    grayscale: 'Grayscale',
    colourWeakness: 'Colour weakness',
    tabs: {
      appearance: 'Appearance',
      layout: 'Layout',
      general: 'General',
      preset: 'Presets'
    },
    blocks: {
      title: 'Blocks',
      tabs: 'Tab bar',
      breadcrumb: 'Breadcrumb',
      footer: 'Footer'
    },
    tabsBar: {
      title: 'Tabs',
      mode: 'Tab style',
      button: 'Button',
      chrome: 'Chrome',
      cache: 'Restore tabs after reload',
      middleClick: 'Close tab with middle click'
    },
    watermark: {
      title: 'Watermark',
      visible: 'Show watermark',
      text: 'Watermark text',
      userName: 'Use user name',
      time: 'Use current time'
    },
    preset: {
      default: 'Default',
      defaultDesc: 'Light scheme, vertical menu, default radius',
      dark: 'Dark',
      darkDesc: 'Dark scheme with the default layout',
      compact: 'Compact',
      compactDesc: 'Green primary, horizontal menu, small radius',
      azir: 'Azir',
      azirDesc: 'Cool dark mix layout with a larger radius'
    }
  },
  error: {
    forbidden: 'No permission',
    forbiddenDescription: 'This account cannot access the requested page. Go back or return home to continue.',
    notFound: 'Page not found',
    notFoundDescription:
      'The requested address does not exist. The original URL is preserved for debugging and sharing.',
    serverError: 'Service unavailable',
    serverErrorDescription: 'The page service encountered an error. Go back to retry the operation or return home.'
  }
} satisfies MessageSchema;
