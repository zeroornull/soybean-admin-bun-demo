import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCaptcha } from './use-captcha';

describe('useCaptcha', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects invalid phones and starts a countdown after a successful send', async () => {
    const captcha = useCaptcha(2);
    const request = vi.fn().mockResolvedValue(true);

    expect(await captcha.send('123', request)).toBe(false);
    expect(request).not.toHaveBeenCalled();

    expect(await captcha.send('13800138000', request)).toBe(true);
    expect(captcha.counting.value).toBe(true);
    expect(captcha.remain.value).toBe(2);

    expect(await captcha.send('13800138000', request)).toBe(false);
    expect(request).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);
    expect(captcha.counting.value).toBe(false);
  });
});
