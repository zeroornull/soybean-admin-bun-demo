import { describe, expect, it } from 'vitest';
import { parseHtmlBuildTime, readRemoteBuildTime, shouldNotifyUpdate } from './app-version';

describe('app version notification', () => {
  it('reads buildTime meta and only notifies when the stamp changes', () => {
    const html = '<head><meta name="buildTime" content="2026-08-25T10:00:00.000Z"></head>';

    expect(parseHtmlBuildTime(html)).toBe('2026-08-25T10:00:00.000Z');
    expect(shouldNotifyUpdate('2026-08-25T10:00:00.000Z', '2026-08-25T10:00:00.000Z')).toBe(false);
    expect(shouldNotifyUpdate('2026-08-25T10:00:00.000Z', '2026-08-25T11:00:00.000Z')).toBe(true);
    expect(shouldNotifyUpdate('2026-08-25T10:00:00.000Z', null)).toBe(false);
  });

  it('treats a failed index.html fetch as no update', async () => {
    const fetchImpl = (async () => new Response('nope', { status: 404 })) as typeof fetch;

    expect(await readRemoteBuildTime('/', fetchImpl)).toBeNull();
  });
});
