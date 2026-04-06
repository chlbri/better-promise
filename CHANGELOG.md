## CHANGELOG

<details>
<summary>

## **[0.1.0] - 06/04/2026** => _15:00_

</summary>

- Add `withTimeout` — enveloppe une promesse avec un ou plusieurs délais d'expiration ; expose aussi `withTimeout.safe` qui absorbe les rejets au lieu de les propager
- Add `racePromises` — course entre plusieurs `TimeoutPromise` via `Promise.race`, avec annulation automatique des perdants
- Add `anyPromises` — course entre plusieurs `TimeoutPromise` via `Promise.any`, avec annulation automatique des perdants
- Add `asyncfy` — convertit une fonction synchrone en fonction asynchrone
- Add `typedPromisify` — transforme une fonction à callback en fonction retournant une `Promise`, avec typage fort
- Add types utilitaires : `TimeoutPromise`, `Fn`, `Callback`, `CbParams`, `ResultFrom`, etc.
- <u>Test coverage **_100%_**</u>

</details>

<br/>
