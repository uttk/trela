export type ApisBase = {
  [key: string]: (...args: any[]) => Promise<any>;
};

/* eslint-disable no-undef, no-unused-vars, @typescript-eslint/no-unused-vars */

export type ResolvePromise<A extends ApisBase[string]> = A extends (
  ...args: any
) => Promise<infer C>
  ? C
  : never;

/* eslint-enable no-undef, no-unused-vars, @typescript-eslint/no-unused-vars */

export type CreateApiRequest<A extends ApisBase, AK extends keyof A> = {
  name: AK;
  args: Parameters<A[AK]>;
};

export type ExcludeNull<R> = Exclude<R, null>;

export type PromiseCreator<R> = () => Promise<R>;
