import { createTests } from '@bemedev/dev-utils/vitest-extended';
import { asyncfy } from './asyncify';

describe('Asyncify', () => {
  const isArray = <T>(value: unknown): value is Array<T> =>
    Array.isArray(value);
  const { success, acceptation } = createTests(asyncfy(isArray));

  describe('#0 => Acceptation', acceptation);
  describe(
    '#1 => Success',
    success(
      {
        invite: 'array',
        parameters: [[1, 2, 3]],
        expected: true,
      },
      {
        invite: 'Not Array, boolean',
        parameters: [true],
        expected: false,
      },
    ),
  );
});
