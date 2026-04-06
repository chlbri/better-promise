import { toPromise } from './toPromise';

describe('toPromise', () => {
  it('should convert a synchronous function to a promise', async () => {
    const syncFunction = (a: number, b: number) => a + b;
    const asyncFunction = toPromise(syncFunction);

    const result = await asyncFunction(1, 2);
    expect(result).toBe(3);
  });

  it('should handle functions with no arguments', async () => {
    const syncFunction = () => 'test';
    const asyncFunction = toPromise(syncFunction);

    const result = await asyncFunction();
    expect(result).toBe('test');
  });

  it('should handle functions with multiple arguments', async () => {
    const syncFunction = (a: number, b: number, c: number) => a + b + c;
    const asyncFunction = toPromise(syncFunction);

    const result = await asyncFunction(1, 2, 3);
    expect(result).toBe(6);
  });

  it('should handle functions with this context', async () => {
    class Test {
      _val = 42;
      value() {
        return this._val;
      }
    }
    const context = new Test();

    const asyncFunction = toPromise(context.value, context);

    const result = await asyncFunction();
    expect(result).toBe(42);
  });

  it('should handle functions that throw errors', async () => {
    const syncFunction = () => {
      throw new Error('Test error');
    };
    const asyncFunction = toPromise(syncFunction);

    await expect(asyncFunction()).rejects.toThrow('Test error');
  });
});
