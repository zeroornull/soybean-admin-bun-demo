<script setup lang="ts">
import { computed } from 'vue';
import { NCard } from 'naive-ui';
import type { Component } from 'vue';
import { useI18n } from 'vue-i18n';
import LocaleSwitch from '@/components/locale-switch.vue';
import ThemeControls from '@/components/theme-controls.vue';
import BindWechat from './modules/bind-wechat.vue';
import CodeLogin from './modules/code-login.vue';
import PwdLogin from './modules/pwd-login.vue';
import RegisterForm from './modules/register.vue';
import ResetPwdForm from './modules/reset-pwd.vue';
import { type LoginModule } from './modules';
import { useLoginModule } from './use-login-module';

defineOptions({ name: 'Login' });

const { t } = useI18n();
const { module } = useLoginModule();
const moduleMap: Record<LoginModule, Component> = {
  'pwd-login': PwdLogin,
  'code-login': CodeLogin,
  register: RegisterForm,
  'reset-pwd': ResetPwdForm,
  'bind-wechat': BindWechat
};
const activeComponent = computed(() => moduleMap[module.value]);
const titleKey = computed(() => {
  const keys: Record<LoginModule, string> = {
    'pwd-login': 'login.title',
    'code-login': 'login.modules.code',
    register: 'login.modules.register',
    'reset-pwd': 'login.modules.reset',
    'bind-wechat': 'login.modules.wechat'
  };

  return keys[module.value];
});
</script>

<template>
  <main data-page="login" :data-login-module="module" class="min-h-screen flex overflow-hidden bg-[var(--layout-bg)]">
    <aside
      data-login-brand
      class="relative hidden min-h-screen flex-1 overflow-hidden p-56px text-white lg:flex lg:items-center"
      style="background: linear-gradient(135deg, var(--primary-pressed), var(--primary), var(--primary-hover))"
    >
      <div class="absolute -right-120px -top-120px size-360px rd-full border-50px border-white/10" />
      <div class="absolute -bottom-160px -left-100px size-420px rd-full border-60px border-white/10" />
      <div class="relative z-1 max-w-560px">
        <div class="size-54px flex items-center justify-center rd-14px bg-white/18 text-22px font-800 shadow-lg">
          SA
        </div>
        <p class="mb-0 mt-28px text-14px font-700 tracking-2px uppercase opacity-75">Soybean Admin</p>
        <h1 class="mb-0 mt-10px text-42px font-750 leading-tight">{{ t('login.brandTagline') }}</h1>
        <ul class="mb-0 mt-32px grid gap-14px p-0 text-15px list-none">
          <li class="flex items-center gap-10px">
            <span aria-hidden="true">✓</span>
            {{ t('login.brandPointRoute') }}
          </li>
          <li class="flex items-center gap-10px">
            <span aria-hidden="true">✓</span>
            {{ t('login.brandPointState') }}
          </li>
          <li class="flex items-center gap-10px">
            <span aria-hidden="true">✓</span>
            {{ t('login.brandPointTheme') }}
          </li>
        </ul>
      </div>
    </aside>

    <section data-login-form-panel class="relative min-w-0 flex flex-1 items-center justify-center p-20px sm:p-36px">
      <NCard data-login-card class="w-full max-w-460px shadow-[0_24px_80px_rgba(15,23,42,0.12)]" size="large">
        <div class="mb-22px lg:hidden">
          <div class="size-44px flex items-center justify-center rd-11px bg-primary text-18px font-800 text-white">
            SA
          </div>
        </div>

        <h1 class="m-0 text-30px font-700">{{ t(titleKey) }}</h1>
        <p class="mb-0 mt-8px opacity-72">{{ t('login.description') }}</p>

        <component :is="activeComponent" />

        <RouterLink
          data-nav="home"
          class="mt-16px inline-block text-13px text-primary transition-opacity hover:opacity-80"
          to="/home"
        >
          {{ t('login.openProtectedHome') }}
        </RouterLink>
      </NCard>

      <div class="absolute right-16px top-16px flex items-center gap-6px">
        <ThemeControls />
        <LocaleSwitch />
      </div>
    </section>
  </main>
</template>
