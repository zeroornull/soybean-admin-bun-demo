import { useRouter } from 'vue-router';

export function useExceptionNavigation() {
  const router = useRouter();

  async function goHome() {
    const homeRouteName = import.meta.env.VITE_ROUTE_HOME;

    if (router.hasRoute(homeRouteName)) {
      await router.replace({ name: homeRouteName });
      return;
    }

    // Anonymous cold starts do not have auth routes registered yet; let the existing guard convert /home to login.
    await router.replace({ path: '/home' });
  }

  async function goBackOrHome() {
    const back = router.options.history.state.back;
    const currentPath = router.currentRoute.value.fullPath;

    if (typeof back === 'string' && back && back !== currentPath) {
      router.back();
      return;
    }

    await goHome();
  }

  return {
    goHome,
    goBackOrHome
  };
}
