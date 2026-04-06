# @bemedev/better-promise

Promise utilities with timeout control, race helpers, and strong typing.

<br/>

## Installation

```sh
pnpm add @bemedev/better-promise
```

## API

### `withTimeout(promise, id, ...timeouts)`

Wraps a promise with one or more timeout deadlines. Rejects with a message like `"Timed out after 500 ms."` if the promise does not settle in time. Automatically clears all timers on settlement.

```ts
import { withTimeout } from '@bemedev/better-promise';

const wrapped = withTimeout(
  () => fetch('/api/data').then(r => r.json()),
  'fetch-data',
  3000, // reject after 3 s
);

const result = await wrapped();

// Cancel at any time
wrapped.abort();
```

#### `withTimeout.safe(promise, id, ...timeouts)`

Same as `withTimeout` but resolves to `undefined` instead of rejecting on timeout or abort.

---

### `racePromises(id, ...promises)`

Races multiple `TimeoutPromise`s using `Promise.race`. The first to settle wins; all others are aborted.

```ts
import { racePromises, withTimeout } from '@bemedev/better-promise';

const a = withTimeout(() => fetchA(), 'a', 1000);
const b = withTimeout(() => fetchB(), 'b', 1000);

const winner = racePromises('race-ab', a, b);
const result = await winner();
```

---

### `anyPromises(id, ...promises)`

Races multiple `TimeoutPromise`s using `Promise.any`. Resolves with the first fulfillment; rejects only when all have rejected.

```ts
import { anyPromises, withTimeout } from '@bemedev/better-promise';

const a = withTimeout(() => fetchA(), 'a', 1000);
const b = withTimeout(() => fetchB(), 'b', 1000);

const first = anyPromises('any-ab', a, b);
const result = await first();
```

---

### `asyncfy(fn)`

Wraps a synchronous function so it returns a `Promise`.

```ts
import { asyncfy } from '@bemedev/better-promise';

const asyncAdd = asyncfy((a: number, b: number) => a + b);
const result = await asyncAdd(1, 2); // 3
```

---

### `typedPromisify(fn)`

Converts a Node.js-style callback function `(…args, cb)` into a promise-returning function, fully typed.

```ts
import { typedPromisify } from '@bemedev/better-promise';
import fs from 'node:fs';

const readFile = typedPromisify(fs.readFile);
const content = await readFile('./file.txt', 'utf8');
```

---

## Types

| Type                | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `TimeoutPromise<T>` | Callable promise with `.abort()` and `.id` properties |
| `Fn<Args, R>`       | Generic function type                                  |
| `Callback`          | Node-style callback — `(err, result?)` or `(err)`      |
| `CbParams`          | Tuple of `[...args, Callback]`                         |
| `ResultFrom<T>`     | Infers the promise-returning signature from `CbParams` |

<br/>

## Licence

MIT

## CHANGELOG

Read [CHANGELOG.md](CHANGELOG.md) for more details about the changes.

<br/>

## Auteur

chlbri (bri_lvi@icloud.com)

[My github](https://github.com/chlbri?tab=repositories)

[<svg width="98" height="96" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/></svg>](https://github.com/chlbri?tab=repositories)

<br/>

## Liens

- [Documentation](https://github.com/chlbri/new-package)
