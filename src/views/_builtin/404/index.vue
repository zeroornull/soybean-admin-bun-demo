<script setup lang="ts">
import ExceptionBase from '@/components/exception-base.vue';
import { useExceptionNavigation } from '@/composables/use-exception-navigation';

defineOptions({ name: 'NotFound' });

const { goHome, goBackOrHome } = useExceptionNavigation();
</script>

<template>
  <ExceptionBase
    :code="404"
    title-key="error.notFound"
    description-key="error.notFoundDescription"
    illustration="not-found"
    :primary-action="{ labelKey: 'common.backHome' }"
    :secondary-action="{ labelKey: 'common.goBack' }"
    @primary="goHome"
    @secondary="goBackOrHome"
  />
</template>
