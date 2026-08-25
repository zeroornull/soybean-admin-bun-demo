<script setup lang="ts">
import ExceptionBase from '@/components/exception-base.vue';
import { useExceptionNavigation } from '@/composables/use-exception-navigation';

defineOptions({ name: 'Forbidden' });

const { goHome, goBackOrHome } = useExceptionNavigation();
</script>

<template>
  <ExceptionBase
    :code="403"
    title-key="error.forbidden"
    description-key="error.forbiddenDescription"
    illustration="permission"
    :primary-action="{ labelKey: 'common.backHome' }"
    :secondary-action="{ labelKey: 'common.goBack' }"
    @primary="goHome"
    @secondary="goBackOrHome"
  />
</template>
