<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { NAlert, NButton, NForm, NFormItem, NInput } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useCaptcha } from '@/composables/use-captcha';
import { fetchSendCaptcha } from '@/service/api';
import { useAuthStore } from '@/store/auth';
import { demoCaptchaCode, demoSuperPhone, demoUserPhone, isValidCaptcha, isValidPhone } from '../modules';
import { useLoginModule } from '../use-login-module';

defineOptions({ name: 'CodeLogin' });

const router = useRouter();
const authStore = useAuthStore();
const { go, getRedirectPath } = useLoginModule();
const { counting, loading: captchaLoading, remain, send } = useCaptcha();
const { t } = useI18n();
const formRef = ref<FormInst | null>(null);
const showError = ref(false);
const captchaHint = ref('');
const formModel = reactive({
  phone: demoUserPhone,
  code: ''
});
const formRules = computed<FormRules>(() => ({
  phone: [
    {
      required: true,
      trigger: ['blur', 'input'],
      validator: (_rule, value: string) => {
        if (!isValidPhone(value || '')) return new Error(t('login.phoneInvalid'));
        return true;
      }
    }
  ],
  code: [
    {
      required: true,
      trigger: ['blur', 'input'],
      validator: (_rule, value: string) => {
        if (!isValidCaptcha(value || '')) return new Error(t('login.codeInvalid'));
        return true;
      }
    }
  ]
}));
const localizedError = computed(() => {
  if (!authStore.authError) return '';
  return /invalid phone or captcha/i.test(authStore.authError) ? t('login.invalidCaptcha') : t('login.requestFailed');
});

async function sendCaptcha() {
  if (!isValidPhone(formModel.phone)) {
    captchaHint.value = t('login.phoneInvalid');
    return;
  }

  const ok = await send(formModel.phone, async () => {
    const { error } = await fetchSendCaptcha(formModel.phone);
    return !error;
  });

  if (ok) captchaHint.value = t('login.captchaSent', { code: demoCaptchaCode });
}

async function submit() {
  if (authStore.loading || !formRef.value) return;
  showError.value = false;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  const success = await authStore.loginByCode(formModel.phone.trim(), formModel.code.trim());

  if (success) {
    await router.replace(getRedirectPath());
  } else if (authStore.authError) {
    showError.value = true;
  }
}
</script>

<template>
  <NForm
    ref="formRef"
    data-auth-form="code"
    class="mt-24px"
    :model="formModel"
    :rules="formRules"
    label-placement="top"
    size="large"
    @submit.prevent="submit"
  >
    <NFormItem :label="t('login.phone')" path="phone">
      <NInput v-model:value="formModel.phone" data-auth-input="phone" :placeholder="t('login.phonePlaceholder')" />
    </NFormItem>
    <NFormItem :label="t('login.code')" path="code">
      <div class="w-full flex gap-10px">
        <NInput v-model:value="formModel.code" data-auth-input="code" :placeholder="t('login.codePlaceholder')" />
        <NButton data-auth-action="captcha" :disabled="counting" :loading="captchaLoading" @click="sendCaptcha">
          {{ counting ? t('login.captchaWait', { time: remain }) : t('login.getCode') }}
        </NButton>
      </div>
    </NFormItem>
    <p v-if="captchaHint" data-login-captcha-hint class="mt-0 mb-12px text-12px opacity-70">{{ captchaHint }}</p>
    <NAlert
      v-if="showError && localizedError"
      data-auth-error
      class="mb-18px"
      :title="t('login.loginFailed')"
      type="error"
    >
      {{ localizedError }}
    </NAlert>
    <NButton data-auth-action="code-login" block type="primary" attr-type="submit" :loading="authStore.loading">
      {{ t('login.signIn') }}
    </NButton>
    <NButton class="mt-10px" block secondary type="default" data-login-go="pwd-login" @click="go('pwd-login')">
      {{ t('login.backToPassword') }}
    </NButton>
    <p class="mb-0 mt-12px text-12px opacity-65">
      {{ t('login.codeDemo', { superPhone: demoSuperPhone, userPhone: demoUserPhone, code: demoCaptchaCode }) }}
    </p>
  </NForm>
</template>
