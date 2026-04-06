import { sleep } from '@bemedev/sleep';
import { createFakeWaiter } from '@bemedev/dev-utils/vitest-extended';
import { withTimeout } from './withTimeout';

const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

beforeAll(() => {
  vi.useFakeTimers();
});

describe('withTimeout', () => {
  test('#01 => should resolve when promise completes before timeout', async () => {
    const promise = () => Promise.resolve('success');
    const wrapped = withTimeout(promise, 'test', 1000);

    await expect(wrapped()).resolves.toBe('success');
  });

  test('#02 => should timeout when promise takes too long', async () => {
    const promise = () => sleep(2000);
    const wrapped = withTimeout(promise, 'test', 100);

    vi.advanceTimersToNextTimerAsync();
    await expect(wrapped()).rejects.toBe('Timed out after 100 ms.');
  });

  test('#03 => should abort when called', async () => {
    const promise = () => sleep(1000);
    const wrapped = withTimeout(promise, 'test', 2000);

    const promise1 = wrapped();
    wrapped.abort();

    await expect(promise1).rejects.toBe('Aborted.');
  });

  test('#04 => should use the first timeout that expires', async () => {
    const promise = () => sleep(3000);
    const wrapped = withTimeout(promise, 'test', 1000, 1500, 500);

    vi.advanceTimersToNextTimerAsync();
    await expect(wrapped()).rejects.toBe('Timed out after 500 ms.');
  });

  test('#05 => should handle rejected promises', async () => {
    const error = new Error('test error');
    const promise = () => Promise.reject(error);
    const wrapped = withTimeout(promise, 'test', 1000);

    await expect(wrapped()).rejects.toThrow(error);
  });

  describe('#06 => should clear all timeouts after resolution', () => {
    beforeAll(() => {
      clearTimeoutSpy.mockClear();
    });

    const promise = () => Promise.resolve('success');
    const wrapped = withTimeout(promise, 'test', 100, 200, 300);

    let result = undefined as unknown as string;

    test('#01 => result is undefined', () => {
      expect(result).toBeUndefined();
    });

    test('#02 => Wait for wrapped', async () => {
      result = await wrapped();
    });

    describe('#03 => Check Result', () => {
      test('#01 => result is defined', () => {
        expect(result).toBeDefined();
      });

      test('#02 => result is success', () => {
        expect(result).toBe('success');
      });
    });

    test('#04 => clearTimeoutSpy is called 4 times', () => {
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(4);
    });
  });

  test('#07 => should have correct id property', async () => {
    const promise = () => Promise.resolve();
    const wrapped = withTimeout(promise, 'test-id', 1000);

    createFakeWaiter(vi)(1000);
    expect(wrapped.id).toBe('test-id');
    await expect(wrapped()).resolves.toBeUndefined();
  });

  test('#08 => no error', async () => {
    const promise = () => sleep(3000);
    const wrapped = withTimeout.safe(promise, 'test', 2000);

    createFakeWaiter(vi)(3000);
    await expect(wrapped()).resolves.toBeUndefined();
  });
});
