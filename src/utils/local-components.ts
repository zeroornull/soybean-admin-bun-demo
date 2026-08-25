export const localComponentRegistry = {
  SvgIcon: '@/components/svg-icon.vue',
  LocaleSwitch: '@/components/locale-switch.vue',
  ThemeControls: '@/components/theme-controls.vue',
  ExceptionBase: '@/components/exception-base.vue'
} as const;

export type LocalComponentName = keyof typeof localComponentRegistry;

function usedInTemplate(code: string, name: string) {
  return new RegExp(`<${name}(?:[\\s/>]|$)`).test(code);
}

function alreadyImported(code: string, specifier: string) {
  return code.includes(specifier);
}

export function collectUsedLocalComponents(code: string) {
  return (Object.keys(localComponentRegistry) as LocalComponentName[]).filter(name => usedInTemplate(code, name));
}

export function injectLocalComponentImports(code: string) {
  const missing = collectUsedLocalComponents(code).filter(name => !alreadyImported(code, localComponentRegistry[name]));

  if (!missing.length) return code;

  const imports = missing.map(name => `import ${name} from '${localComponentRegistry[name]}';`).join('\n');
  const scriptSetup = code.match(/<script\b[^>]*\bsetup\b[^>]*>/);

  if (scriptSetup?.[0]) {
    return code.replace(scriptSetup[0], `${scriptSetup[0]}\n${imports}`);
  }

  return `<script setup lang="ts">\n${imports}\n</script>\n${code}`;
}
