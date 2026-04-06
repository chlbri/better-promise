import type { CallBackError, CallBackResult } from './types';
import { typedPromisify } from './promisify';

declare const fn1: (a: number, b: string, cb: CallBackError) => number;
const prom1 = typedPromisify(fn1);

expectTypeOf(prom1).toEqualTypeOf<
  (a: number, b: string) => Promise<void>
>();

declare const fn2: (
  a: number,
  b: string,
  c: boolean,
  cb: CallBackResult<number>,
) => string;
const prom2 = typedPromisify(fn2);

expectTypeOf(prom2).toEqualTypeOf<
  (a: number, b: string, c: boolean) => Promise<number>
>();

declare const fn3: (
  params: { a: number; b: string; c: boolean },
  cb: CallBackResult<boolean>,
) => string;
const prom3 = typedPromisify(fn3);

expectTypeOf(prom3).toEqualTypeOf<
  (params: { a: number; b: string; c: boolean }) => Promise<boolean>
>();
