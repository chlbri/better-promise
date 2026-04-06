import { CbParams, Fn, ResultFrom } from './types';

type Promisify_F = <T extends CbParams>(fn: Fn<T>) => ResultFrom<T>;

/**
 * Promisify a function
 * Strongly typed
 *
 * Credits to : {@link https://youtu.be/RSknW_dGHrU|Types Rocks}
 * @param fn The function to parse
 * @returns A promisified function
 */
const _typedPromisify = (fn: any) => {
  return (...args: any) => {
    return new Promise((resolve, reject) => {
      function customCallback(err: any, ...results: any) {
        if (err) return reject(err);
        console.warn(results.length);
        return resolve(results[0]);
      }
      args.push(customCallback);
      fn(...args);
    });
  };
};

export const typedPromisify = _typedPromisify as Promisify_F;
