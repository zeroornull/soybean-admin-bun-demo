<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { NAlert, NButton, NForm, NFormItem, NInput } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useLoginModule } from '../use-login-module';

defineOptions({ name: 'PwdLogin' });

const router = useRouter();
const authStore = useAuthStore();
const { go, getRedirectPath } = useLoginModule();
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
  <div>
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

    <div class="mt-16px flex flex-wrap gap-10px text-13px">
      <button
        class="bg-transparent p-0 text-primary"
        type="button"
        data-login-go="code-login"
        @click="go('code-login')"
      >
        {{ t('login.modules.code') }}
      </button>
      <button class="bg-transparent p-0 text-primary" type="button" data-login-go="register" @click="go('register')">
        {{ t('login.modules.register') }}
      </button>
      <button class="bg-transparent p-0 text-primary" type="button" data-login-go="reset-pwd" @click="go('reset-pwd')">
        {{ t('login.modules.reset') }}
      </button>
      <button
        class="bg-transparent p-0 text-primary"
        type="button"
        data-login-go="bind-wechat"
        @click="go('bind-wechat')"
      >
        {{ t('login.modules.wechat') }}
      </button>
    </div>

    <div data-login-demo class="mt-22px rd-10px bg-[var(--layout-bg)] p-12px text-12px leading-20px">
      <strong>{{ t('login.demoAccounts') }}</strong>
      <p class="m-0 mt-4px">{{ t('login.superAccount') }}</p>
      <p class="m-0">{{ t('login.regularAccount') }}</p>
      <p class="mb-0 mt-5px opacity-65">{{ t('login.passwordMemoryOnly') }}</p>
    </div>
  </div>
</template>
