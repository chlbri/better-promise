export type Fn<Args extends any[] = any[], R = any> = (...args: Args) => R;

export type FnBasic<Main extends Fn, Tr extends object> = Tr & Main;

export interface TimeoutPromise<T = any> {
  (): Promise<T>;
  abort: () => void;
  id: string;
}

export type TypeFromTimeout<T extends TimeoutPromise> =
  T extends TimeoutPromise<infer U> ? U : never;

export type TypeFromTimeouts<T extends TimeoutPromise[]> = TypeFromTimeout<
  T[number]
>;

export type CallBackError = (err: any) => void;

export type CallBackResult<T = any> = (err: any, result: T) => void;

export type Callback = CallBackError | CallBackResult;

type GetResult<Cb extends Callback> = Parameters<Cb>['length'] extends 2
  ? Parameters<Cb>[1]
  : void;

export type CbParams = [...any[], Callback];

export type ResultFrom<T> = T extends [
  ...infer Args extends any[],
  infer Cb extends Callback,
]
  ? Fn<Args, Promise<GetResult<Cb>>>
  : never;
