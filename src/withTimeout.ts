import type { TimeoutPromise } from './types';
import { MAX_TIMEOUT } from './constants';
import { expandFn } from './utils';

type WithTimeout_F<N extends undefined = never> = <T = any>(
  promise: () => Promise<T>,
  id: string,
  ..._timeouts: number[]
) => TimeoutPromise<T | N>;

/**
 * Wraps a promise with multiple timeout mechanisms to ensure it resolves or rejects within the specified time limits.
 *
 * @param promise - A function that returns a promise to be wrapped with timeouts.
 * @param id - An identifier for the wrapped promise.
 * @param timeouts - A list of timeout durations in milliseconds. The promise will be rejected if it does not resolve within any of these timeouts.
 * @returns A function that, when called, returns a promise which races against the specified timeouts. The returned function also has an `abort` method to cancel the promise and an `id` property.
 *
 * @template WithTimeout_F - The type of the function that wraps the promise.
 *
 * @example
 * const myPromise = () => new Promise((resolve) => setTimeout(() => resolve('Done'), 1000));
 * const wrappedPromise = withTimeout(myPromise, 'examplePromise', 500, 1500);
 *
 * wrappedPromise().then(console.log).catch(console.error); // Will log "Timed out after 500 ms."
 *
 * // To abort the promise
 * wrappedPromise.abort();
 */
const _withTimeout: WithTimeout_F = (promise, id, ...timeouts) => {
  // Add a positive infinity timeout to ensure the promise never hangs.
  const _timeouts = [...timeouts, MAX_TIMEOUT];

  const timeoutPids = Array.from(
    { length: _timeouts.length },
    () => undefined as NodeJS.Timeout | undefined,
  );

  const controller = new AbortController();

  const timeoutPromises = _timeouts.map(async (millis, i) => {
    return await new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => {
        reject('Aborted.');
      });

      return (timeoutPids[i] = setTimeout(
        () => reject(`Timed out after ${millis} ms.`),
        millis,
      ));
    });
  });

  const out = async () =>
    (await Promise.race([promise(), ...timeoutPromises]).finally(() => {
      timeoutPids.forEach(pid => {
        if (pid) {
          clearTimeout(pid);
        }
      });
    })) as any;

  out.abort = () => controller.abort();
  out.id = id;

  return out;
};

export const withTimeout = expandFn(_withTimeout, {
  safe: ((promise, id, ...timeouts) => {
    const out1 = withTimeout(promise, id, ...timeouts);
    const out2 = () => out1().catch(() => undefined);
    const out3 = withTimeout(out2, id);

    return out3;
  }) as WithTimeout_F<undefined>,
});
