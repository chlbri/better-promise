import { createTests } from '@bemedev/dev-utils/vitest-extended';
import { stat } from 'node:fs';
import { typedPromisify } from './promisify';

const chekEnv = process.env.NODE_ENV !== 'ci';

describe.runIf(chekEnv)('typedPromisify', () => {
  const promisifed1 = typedPromisify(stat);
  const func = async (file: string) => {
    const out1 = await promisifed1(file, {});
    return !!out1;
  };

  const { success, fails, acceptation } = createTests(func);
  describe('#0 => Acceptation', acceptation);

  describe(
    '#1=> Errors',
    fails({
      invite: 'Fake file',
      parameters: `${__filename}.package.json`,
    }),
  );

  describe(
    '#2 => Success',
    success(
      {
        invite: 'currentFile',
        parameters: __filename,
        expected: true,
      },
      {
        invite: 'currentFolder',
        parameters: __dirname,
        expected: true,
      },
      {
        invite: 'cwd',
        parameters: process.cwd(),
        expected: true,
      },
    ),
  );
});
