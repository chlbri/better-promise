import { sleep } from '@bemedev/sleep';
import { anyPromises } from './any';
import { withTimeout } from './withTimeout';

beforeAll(() => {
  vi.useFakeTimers();
});

describe('anyPromises', () => {
  it('#01 => should return the first resolved promise', async () => {
    const promise1 = withTimeout(
      () => sleep(100).then(() => 'first'),
      'p1',
    );

    const promise2 = withTimeout(
      () => sleep(200).then(() => 'second'),
      'p2',
    );

    const race = anyPromises('race', promise1, promise2);

    vi.advanceTimersByTimeAsync(200);
    await expect(race()).resolves.toBe('first');
  });

  describe('#02 => should cancel all remaining promises', async () => {
    const abortSpy = vi.fn();
    let result = undefined as unknown as string;

    const race = async () => {
      const promise1 = withTimeout(
        () => sleep(300).then(() => 'first'),
        'p1',
      );
      const promise2 = withTimeout(
        () => sleep(200).then(() => 'second'),
        'p2',
      );
      promise1.abort = abortSpy;
      promise2.abort = abortSpy;

      // Resolve the first promise
      vi.advanceTimersByTimeAsync(200);
      result = await anyPromises('race', promise1, promise2)();
    };

    it('#01 => result is undefined', () => {
      expect(result).toBeUndefined();
    });

    it('#02 => Await race', race);

    it('#03 => should return the first resolved promise', () => {
      expect(result).toBe('second');
    });

    it('#04 => should call the abort method twice', () => {
      expect(abortSpy).toHaveBeenCalledTimes(2);
    });
  });

  test('#03 => should pass rejections', async () => {
    const TEXT = 'Test second';

    const promise1 = withTimeout(
      () => Promise.reject(new Error('Test error')),
      'p1',
    );
    const promise2 = withTimeout(() => sleep(200).then(() => TEXT), 'p2');
    const promise3 = withTimeout(
      () => sleep(500).then(() => `${TEXT}-third`),
      'p2',
    );
    const race = anyPromises('race', promise1, promise2, promise3);

    vi.advanceTimersByTimeAsync(200);
    await expect(race()).resolves.toBe(TEXT);
  });

  describe('#04 => should retain the provided identifier', async () => {
    const promise1 = withTimeout(() => Promise.resolve('first'), 'p1');
    const promise2 = withTimeout(() => Promise.resolve('second'), 'p2');
    const testID = 'test-id';

    const race = anyPromises(testID, promise1, promise2);

    it('#01 => should retain the provided identifier', () => {
      expect(race.id).toBe(testID);
    });

    it('#02 => should retain the provided identifier after resolving', async () => {
      vi.advanceTimersByTimeAsync(0);
      await expect(race()).resolves.toBe('first');
    });
  });

  it('#05 => should handle a single promise', async () => {
    const promise = withTimeout(() => Promise.resolve('single'), 'p1');
    const race = anyPromises('single', promise);

    const result = await race();
    expect(result).toBe('single');
  });

  it('#06 => should handle multiple promises with different times', async () => {
    const promise1 = withTimeout(
      () => sleep(300).then(() => 'first'),
      'p1',
    );
    const promise2 = withTimeout(
      () => sleep(100).then(() => 'second'),
      'p2',
    );
    const promise3 = withTimeout(
      () => sleep(200).then(() => 'third'),
      'p3',
    );

    vi.advanceTimersByTimeAsync(300);
    const race = anyPromises('race', promise1, promise2, promise3);
    const result = await race();

    expect(result).toBe('second');
  });

  it('#07 => should rejects if all rejects, and reach the last one', async () => {
    const promise1 = withTimeout(async () => {
      await sleep(200);
      return Promise.reject('error1');
    }, 'p1');

    const promise2 = withTimeout(async () => {
      await sleep(100);
      return Promise.reject('error2');
    }, 'p2');

    const promise3 = withTimeout(async () => {
      await sleep(300);
      return Promise.reject('error3');
    }, 'p3');

    vi.advanceTimersByTimeAsync(300);

    const race = anyPromises('test', promise1, promise2, promise3);
    await expect(race).rejects.toThrowError('error3');
  });
});
