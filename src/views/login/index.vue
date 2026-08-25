<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { NAlert, NButton, NCard, NForm, NFormItem, NInput } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import LocaleSwitch from '@/components/locale-switch.vue';
import ThemeControls from '@/components/theme-controls.vue';
import { useAuthStore } from '@/store/auth';

defineOptions({ name: 'Login' });

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const formRef = ref<FormInst | null>(null);
const showAuthError = ref(false);
const formModel = reactive({
  userName: 'Soybean',
  password: '123456'
});
const formRules = computed<FormRules>(() => ({
  userName: [
    {
      required: true,
      whitespace: true,
      message: t('login.userNameRequired'),
      trigger: ['input', 'blur']
    }
  ],
  password: [
    {
      required: true,
      message: t('login.passwordRequired'),
      trigger: ['input', 'blur']
    }
  ]
}));
const localizedAuthError = computed(() => {
  if (!authStore.authError) return '';

  return /invalid user name or password/i.test(authStore.authError)
    ? t('login.invalidCredentials')
    : t('login.requestFailed');
});

function getRedirectPath() {
  const redirect = route.query.redirect;

  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    !redirect.startsWith('/login')
  ) {
    return redirect;
  }

  return '/home';
}

async function submitLogin() {
  if (authStore.loading || !formRef.value) return;

  showAuthError.value = false;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  const success = await authStore.login(formModel.userName.trim(), formModel.password);

  if (success) {
    await router.replace(getRedirectPath());
  } else if (authStore.authError) {
    showAuthError.value = true;
  }
}

function hideAuthError() {
  showAuthError.value = false;
}
</script>

<template>
  <main data-page="login" class="min-h-screen flex overflow-hidden bg-[var(--layout-bg)]">
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

        <h1 class="m-0 text-30px font-700">{{ t('login.title') }}</h1>
        <p class="mb-0 mt-8px opacity-72">{{ t('login.description') }}</p>

        <NForm
          ref="formRef"
          data-auth-form
          class="mt-24px"
          :model="formModel"
          :rules="formRules"
          label-placement="top"
          size="large"
          @submit.prevent="submitLogin"
        >
          <NFormItem :label="t('login.userName')" :label-props="{ for: 'login-username' }" path="userName">
            <NInput
              v-model:value="formModel.userName"
              data-auth-input="userName"
              clearable
              :input-props="{
                id: 'login-username',
                name: 'userName',
                autocomplete: 'username',
                'aria-label': t('login.userName')
              }"
              :placeholder="t('login.userNamePlaceholder')"
              @update:value="hideAuthError"
            />
          </NFormItem>

          <NFormItem :label="t('login.password')" :label-props="{ for: 'login-password' }" path="password">
            <NInput
              v-model:value="formModel.password"
              data-auth-input="password"
              type="password"
              show-password-on="click"
              :input-props="{
                id: 'login-password',
                name: 'password',
                autocomplete: 'current-password',
                'aria-label': t('login.password')
              }"
              :placeholder="t('login.passwordPlaceholder')"
              @update:value="hideAuthError"
            />
          </NFormItem>

          <NAlert
            v-if="showAuthError && localizedAuthError"
            data-auth-error
            class="mb-18px"
            :title="t('login.loginFailed')"
            type="error"
            role="alert"
          >
            {{ localizedAuthError }}
          </NAlert>

          <NButton
            data-auth-action="login"
            block
            :loading="authStore.loading"
            :disabled="authStore.loading"
            type="primary"
            attr-type="submit"
            :aria-busy="authStore.loading"
          >
            {{ authStore.loading ? t('login.signingIn') : t('login.signIn') }}
          </NButton>
        </NForm>

        <div data-login-demo class="mt-22px rd-10px bg-[var(--layout-bg)] p-12px text-12px leading-20px">
          <strong>{{ t('login.demoAccounts') }}</strong>
          <p class="m-0 mt-4px">{{ t('login.superAccount') }}</p>
          <p class="m-0">{{ t('login.regularAccount') }}</p>
          <p class="mb-0 mt-5px opacity-65">{{ t('login.passwordMemoryOnly') }}</p>
        </div>

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
