<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { NAlert, NButton, NForm, NFormItem, NInput } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { fetchResetPassword } from '@/service/api';
import { isValidCaptcha, isValidPhone } from '../modules';
import { useLoginModule } from '../use-login-module';

defineOptions({ name: 'ResetPwdForm' });

const { go } = useLoginModule();
const { t } = useI18n();
const formRef = ref<FormInst | null>(null);
const loading = ref(false);
const message = ref('');
const success = ref(false);
const formModel = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
});
const formRules = computed<FormRules>(() => ({
  phone: [
    {
      required: true,
      trigger: ['blur'],
      validator: (_rule, value: string) => (isValidPhone(value || '') ? true : new Error(t('login.phoneInvalid')))
    }
  ],
  code: [
    {
      required: true,
      trigger: ['blur'],
      validator: (_rule, value: string) => (isValidCaptcha(value || '') ? true : new Error(t('login.codeInvalid')))
    }
  ],
  password: [
    {
      required: true,
      min: 6,
      message: t('login.passwordMin'),
      trigger: ['blur']
    }
  ],
  confirmPassword: [
    {
      required: true,
      trigger: ['blur'],
      validator: (_rule, value: string) =>
        value === formModel.password ? true : new Error(t('login.confirmPasswordMismatch'))
    }
  ]
}));

async function submit() {
  if (loading.value || !formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    return;
  }

  loading.value = true;
  const { error } = await fetchResetPassword(formModel.phone.trim(), formModel.code.trim(), formModel.password);
  loading.value = false;

  if (error) {
    success.value = false;
    message.value = t('login.resetFailed');
    return;
  }

  success.value = true;
  message.value = t('login.resetSuccess');
  await go('pwd-login');
}
</script>

<template>
  <NForm
    ref="formRef"
    data-auth-form="reset"
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
      <NInput v-model:value="formModel.code" data-auth-input="code" :placeholder="t('login.codePlaceholder')" />
    </NFormItem>
    <NFormItem :label="t('login.password')" path="password">
      <NInput v-model:value="formModel.password" type="password" show-password-on="click" data-auth-input="password" />
    </NFormItem>
    <NFormItem :label="t('login.confirmPassword')" path="confirmPassword">
      <NInput
        v-model:value="formModel.confirmPassword"
        type="password"
        show-password-on="click"
        data-auth-input="confirmPassword"
      />
    </NFormItem>
    <NAlert v-if="message" class="mb-18px" :type="success ? 'success' : 'error'" data-login-module-message>
      {{ message }}
    </NAlert>
    <NButton data-auth-action="reset" block type="primary" attr-type="submit" :loading="loading">
      {{ t('login.modules.reset') }}
    </NButton>
    <NButton class="mt-10px" block secondary type="default" data-login-go="pwd-login" @click="go('pwd-login')">
      {{ t('login.backToPassword') }}
    </NButton>
  </NForm>
</template>
