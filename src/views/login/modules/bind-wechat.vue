<script setup lang="ts">
import { ref } from 'vue';
import { NAlert, NButton } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useLoginModule } from '../use-login-module';

defineOptions({ name: 'BindWechat' });

const router = useRouter();
const authStore = useAuthStore();
const { go, getRedirectPath } = useLoginModule();
const { t } = useI18n();
const showError = ref(false);

async function mockScan() {
  showError.value = false;
  const success = await authStore.loginByWechat();

  if (success) {
    await router.replace(getRedirectPath());
    return;
  }

  showError.value = true;
}
</script>

<template>
  <div data-login-wechat class="mt-24px">
    <NAlert type="info" data-login-wechat-demo class="mb-16px">
      {{ t('login.wechatDemo') }}
    </NAlert>
    <div
      class="mx-auto mb-16px size-180px grid place-items-center rd-12px border border-dashed border-[var(--border-color)] text-13px opacity-80"
      data-login-wechat-qr
    >
      {{ t('login.wechatQr') }}
    </div>
    <NAlert v-if="showError" type="error" class="mb-16px" data-auth-error>
      {{ t('login.requestFailed') }}
    </NAlert>
    <NButton data-auth-action="wechat" block type="primary" :loading="authStore.loading" @click="mockScan">
      {{ t('login.wechatMockScan') }}
    </NButton>
    <NButton class="mt-10px" block secondary type="default" data-login-go="pwd-login" @click="go('pwd-login')">
      {{ t('login.backToPassword') }}
    </NButton>
  </div>
</template>
