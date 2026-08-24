<script setup lang="ts">
import { ref } from 'vue';
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
const userName = ref('Soybean');
const password = ref('123456');

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
  const success = await authStore.login(userName.value, password.value);

  if (success) {
    await router.replace(getRedirectPath());
  }
}
</script>

<template>
  <main data-page="login" class="min-h-screen grid place-items-center p-24px">
    <div class="fixed right-16px top-16px flex items-center gap-6px">
      <ThemeControls />
      <LocaleSwitch />
    </div>
    <section class="card-wrapper w-full max-w-420px bg-[var(--card-bg)] p-24px">
      <h1 class="m-0 text-28px font-600">{{ t('login.title') }}</h1>
      <p class="mb-0 mt-8px">{{ t('login.description') }}</p>

      <form data-auth-form class="mt-20px flex flex-col gap-14px" @submit.prevent="submitLogin">
        <label class="flex flex-col gap-6px">
          <span class="text-14px font-600">{{ t('login.userName') }}</span>
          <input
            v-model="userName"
            data-auth-input="userName"
            class="h-40px rd-8px border border-[var(--border-color)] bg-transparent px-12px outline-none focus:border-primary"
            autocomplete="username"
            name="userName"
            required
          />
        </label>

        <label class="flex flex-col gap-6px">
          <span class="text-14px font-600">{{ t('login.password') }}</span>
          <input
            v-model="password"
            data-auth-input="password"
            class="h-40px rd-8px border border-[var(--border-color)] bg-transparent px-12px outline-none focus:border-primary"
            autocomplete="current-password"
            name="password"
            required
            type="password"
          />
        </label>

        <p v-if="authStore.authError" data-auth-error class="m-0 text-14px text-red-500" role="alert">
          {{ authStore.authError }}
        </p>

        <button
          data-auth-action="login"
          class="h-40px rd-8px bg-primary px-12px text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60 hover:(opacity-90)"
          :disabled="authStore.loading"
          type="submit"
        >
          {{ authStore.loading ? t('login.signingIn') : t('login.signIn') }}
        </button>
      </form>

      <RouterLink
        data-nav="home"
        class="mt-16px inline-block text-14px text-primary transition-opacity hover:(opacity-80)"
        to="/home"
      >
        {{ t('login.openProtectedHome') }}
      </RouterLink>
    </section>
  </main>
</template>
