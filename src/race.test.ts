import { createFakeWaiter } from '@bemedev/dev-utils/vitest-extended';
import { sleep } from '@bemedev/sleep';
import { racePromises } from './race';
import { withTimeout } from './withTimeout';

const fakeWaiter = createFakeWaiter(vi);

beforeAll(() => {
  vi.useFakeTimers();
});

describe('racePromises', () => {
  it('#01 => should return the first resolved promise', async () => {
    const promise1 = withTimeout(
      () => sleep(100).then(() => 'first'),
      'p1',
    );

    const promise2 = withTimeout(
      () => sleep(200).then(() => 'second'),
      'p2',
    );

    const race = racePromises('race', promise1, promise2);

    fakeWaiter(200);
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
      fakeWaiter(200);
      result = await racePromises('race', promise1, promise2)();
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

  describe('#03 => should handle promise rejections', async () => {
    const TEST_ERROR = 'Test error';
    const error = new Error(TEST_ERROR);

    const race = () => {
      const promise1 = withTimeout(() => Promise.reject(error), 'p1');
      const promise2 = withTimeout(
        () => sleep(200).then(() => 'second'),
        'p2',
      );

      return racePromises('race', promise1, promise2);
    };

    it('#01 => should reject with the right error', async () => {
      await expect(race()).rejects.toThrow(error);
    });

    it('#02 => should reject with the right error string', async () => {
      fakeWaiter(200);
      await expect(race()).rejects.toThrow(TEST_ERROR);
    });
  });

  describe('#04 => should retain the provided identifier', async () => {
    const promise1 = withTimeout(() => Promise.resolve('first'), 'p1');
    const promise2 = withTimeout(() => Promise.resolve('second'), 'p2');
    const testID = 'test-id';

    const race = racePromises(testID, promise1, promise2);

    it('#01 => should retain the provided identifier', () => {
      expect(race.id).toBe(testID);
    });

    it('#02 => should retain the provided identifier after resolving', async () => {
      fakeWaiter(0);
      await expect(race()).resolves.toBe('first');
    });
  });

  it('#05 => should handle a single promise', async () => {
    const promise = withTimeout(() => Promise.resolve('single'), 'p1');
    const race = racePromises('single', promise);

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

    fakeWaiter(300);
    const race = racePromises('race', promise1, promise2, promise3);
    const result = await race();

    expect(result).toBe('second');
  });

  it('#07 => should reject if first rejects', async () => {
    const promise1 = withTimeout(
      () => sleep(300).then(() => 'first'),
      'p1',
    );
    const promise2 = withTimeout(async () => {
      await sleep(100);
      return Promise.reject('error');
    }, 'p2');

    fakeWaiter(300);
    const race = racePromises('test', promise1, promise2);
    await expect(race).rejects.toBe('error');
  });
});
