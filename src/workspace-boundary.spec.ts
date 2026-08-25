import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const packagesRoot = fileURLToPath(new URL('../packages', import.meta.url));

function collectSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(entry => {
    if (entry === 'node_modules' || entry === 'dist') return [];

    const path = join(dir, entry);

    if (statSync(path).isDirectory()) return collectSourceFiles(path);
    if (!path.endsWith('.ts') || path.endsWith('.spec.ts')) return [];

    return [path];
  });
}

describe('workspace package boundaries', () => {
  it('keeps packages free of app aliases and Pinia', () => {
    const files = collectSourceFiles(packagesRoot);
    const violations = files.flatMap(file => {
      const source = readFileSync(file, 'utf8');
      const hits: string[] = [];

      if (/from ['"]@\//.test(source) || /import\(['"]@\//.test(source)) {
        hits.push(`${file}: imports @/`);
      }

      if (/from ['"]pinia['"]/.test(source) || /import\(['"]pinia['"]\)/.test(source)) {
        hits.push(`${file}: imports pinia`);
      }

      return hits;
    });

    expect(files.length).toBeGreaterThan(0);
    expect(violations).toEqual([]);
  });
});
