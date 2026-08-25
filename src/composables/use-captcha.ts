import { getCurrentInstance, onBeforeUnmount, ref } from 'vue';
import { isValidPhone } from '@/views/login/modules';

export function useCaptcha(seconds = 60) {
  const loading = ref(false);
  const remain = ref(0);
  const counting = ref(false);
  let timer: ReturnType<typeof setInterval> | undefined;

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }

    counting.value = false;
    remain.value = 0;
  }

  function startCountdown() {
    stop();
    counting.value = true;
    remain.value = seconds;
    timer = setInterval(() => {
      remain.value -= 1;
      if (remain.value <= 0) stop();
    }, 1000);
  }

  async function send(phone: string, request: () => Promise<boolean>) {
    if (!isValidPhone(phone) || loading.value || counting.value) return false;

    loading.value = true;

    try {
      const ok = await request();
      if (ok) startCountdown();
      return ok;
    } finally {
      loading.value = false;
    }
  }

  if (getCurrentInstance()) onBeforeUnmount(stop);

  return {
    loading,
    remain,
    counting,
    send,
    stop
  };
}
