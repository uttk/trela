export interface ApisBase {
  [key: string]: (...args: any[]) => Promise<any>;
}

export type Reducer<S, A extends ApisBase> = <AK extends keyof A>(
  state: S,
  action: CreateAction<A, AK>
) => S;

export type CreateAction<A extends ApisBase, AK extends keyof A> = {
  type: AK;
  payload: ResolvePromise<A[AK]>;
};

export type ResolvePromise<A extends ApisBase[string]> = A extends (
  ...args: any
) => Promise<infer T>
  ? T
  : never;

export type Selector<S, R> = (state: S) => [R] | [R, boolean];

export type CreateApiRequest<A extends ApisBase, AK extends keyof A> = {
  request: AK;
  payload: Parameters<A[AK]>;
};
