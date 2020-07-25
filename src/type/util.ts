export interface ApisBase {
  [key: string]: (...args: any[]) => Promise<any>;
}

export type Reducer<S, A extends ApisBase> = (
  state: S,
  action: CreateAction<keyof A, A>
) => S;

export type CreateAction<AK, A extends ApisBase> = AK extends keyof A
  ? {
      type: AK;
      payload: ResolvePromise<A[AK]>;
    }
  : never;

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

export type CreateActionsType<A extends ApisBase> = CreateAction<keyof A, A>;
