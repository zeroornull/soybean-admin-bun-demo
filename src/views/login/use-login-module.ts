import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { defaultLoginModule, getSafeRedirectPath, resolveLoginModule, type LoginModule } from './modules';

export function useLoginModule() {
  const route = useRoute();
  const router = useRouter();
  const module = computed(() => resolveLoginModule(route.params.module));

  function go(next: LoginModule) {
    return router.replace({
      name: 'login',
      params: { module: next },
      query: route.query
    });
  }

  function getRedirectPath() {
    return getSafeRedirectPath(route.query.redirect);
  }

  return {
    module,
    defaultLoginModule,
    go,
    getRedirectPath
  };
}
