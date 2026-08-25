<script setup lang="ts">
import ExceptionBase from '@/components/exception-base.vue';
import { useExceptionNavigation } from '@/composables/use-exception-navigation';

defineOptions({ name: 'ServerError' });

const { goHome, goBackOrHome } = useExceptionNavigation();
</script>

<template>
  <ExceptionBase
    :code="500"
    title-key="error.serverError"
    description-key="error.serverErrorDescription"
    illustration="server"
    :primary-action="{ labelKey: 'common.retry' }"
    :secondary-action="{ labelKey: 'common.backHome' }"
    @primary="goBackOrHome"
    @secondary="goHome"
  />
</template>
