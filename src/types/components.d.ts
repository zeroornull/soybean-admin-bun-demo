export {};

declare module 'vue' {
  export interface GlobalComponents {
    ExceptionBase: (typeof import('../components/exception-base.vue'))['default'];
    LocaleSwitch: (typeof import('../components/locale-switch.vue'))['default'];
    RouterLink: (typeof import('vue-router'))['RouterLink'];
    RouterView: (typeof import('vue-router'))['RouterView'];
    SvgIcon: (typeof import('../components/svg-icon.vue'))['default'];
    ThemeControls: (typeof import('../components/theme-controls.vue'))['default'];
  }
}
