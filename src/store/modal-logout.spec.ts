import { describe, expect, it, vi } from 'vitest';
import { createModalLogoutController } from './modal-logout';

describe('createModalLogoutController', () => {
  it('shares one dialog across concurrent requests and logs out once on confirm', async () => {
    const gate = createModalLogoutController();
    const logout = vi.fn(async () => undefined);

    const first = gate.handle('first', logout);
    const second = gate.handle('second', logout);

    expect(gate.visible.value).toBe(true);
    expect(gate.reason.value).toBe('first');

    gate.confirm();

    await expect(Promise.all([first, second])).resolves.toEqual([true, true]);
    expect(logout).toHaveBeenCalledTimes(1);
    expect(gate.visible.value).toBe(false);
  });

  it('keeps the session when the dialog is cancelled', async () => {
    const gate = createModalLogoutController();
    const logout = vi.fn(async () => undefined);

    const pending = gate.handle('stay signed in', logout);
    gate.cancel();

    await expect(pending).resolves.toBe(false);
    expect(logout).not.toHaveBeenCalled();
    expect(gate.visible.value).toBe(false);
  });
});
