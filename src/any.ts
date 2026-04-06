import { withTimeout } from './withTimeout';
import { TimeoutPromise, TypeFromTimeouts } from './types';

export type RacePromises_F = <T extends TimeoutPromise<any>[]>(
  id: string,
  ..._promises: T
) => TimeoutPromise<TypeFromTimeouts<T>>;

export const anyPromises: RacePromises_F = (id, ..._promises) => {
  const _finally = () => {
    return _promises.forEach(({ abort }) => {
      return abort();
    });
  };

  const promises = _promises.map(promise => promise());
  const out = withTimeout(
    async () =>
      await Promise.any(promises)
        .catch(e => {
          const error = e.errors[e.errors.length - 1];
          throw error;
        })
        .finally(_finally),
    id,
  );

  return out;
};
