import { describe, expect, it } from 'vitest';
import { collectUsedLocalComponents, injectLocalComponentImports } from './local-components';

describe('local component auto-import', () => {
  it('injects missing local component imports into script setup', () => {
    const source = `<script setup lang="ts">
defineOptions({ name: 'Demo' });
</script>
<template>
  <LocaleSwitch />
  <ThemeControls />
</template>
`;

    expect(collectUsedLocalComponents(source)).toEqual(['LocaleSwitch', 'ThemeControls']);
    expect(injectLocalComponentImports(source)).toContain("import LocaleSwitch from '@/components/locale-switch.vue';");
    expect(injectLocalComponentImports(source)).toContain(
      "import ThemeControls from '@/components/theme-controls.vue';"
    );
  });

  it('does not duplicate an import that is already present', () => {
    const source = `<script setup lang="ts">
import LocaleSwitch from '@/components/locale-switch.vue';
</script>
<template>
  <LocaleSwitch />
</template>
`;

    expect(injectLocalComponentImports(source)).toBe(source);
  });
});
