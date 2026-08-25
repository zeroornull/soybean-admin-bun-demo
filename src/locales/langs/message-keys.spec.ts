import { describe, expect, it } from 'vitest';
import { enUS } from './en-us';
import { zhCN } from './zh-cn';

function collectKeys(value: unknown, prefix = ''): string[] {
  if (typeof value === 'string') return prefix ? [prefix] : [];
  if (!value || typeof value !== 'object') return [];

  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    collectKeys(nested, prefix ? `${prefix}.${key}` : key)
  );
}

describe('locale message keys', () => {
  it('keeps the English tree aligned with the Chinese source of shape', () => {
    expect(collectKeys(enUS).sort()).toEqual(collectKeys(zhCN).sort());
  });
});
