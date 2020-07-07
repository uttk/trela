export interface Effect<A extends ApisBase, AK extends keyof A> {
  type: EffectTypes;
  request: AK;
  payload: Parameters<A[AK]>;
}

export interface ApisBase {
  [key: string]: (...args: any) => Promise<any>;
}

export interface Dispacher {
  readonly id: string;

  onComplite(callback: CompliteFunc): () => void;
  dispatch(type: EffectTypes, payload?: any): void;
}

export interface Flow<S> {
  readonly id: string;
  status: FlowStatus;

  getState: () => S;
}

export interface FlowMethods<S> {
  start(): void;
  once(): [S, boolean];
  cancel(payload?: any): void;
  error(payload: Error): void;
  finish(payload?: any): void;
  forceStart(cancel?: boolean, payload?: any): void;
}

export interface Dependency {
  readonly id: number;

  didMount: boolean;
  parents: Dependency[];
  selectors: Selector<any, any>[];

  init(): void;
  updateComponentView(): void;
}

export interface TrelaApis<S, A extends ApisBase> {
  apis: WrapApis<S, A>;
  getState<R>(selector: Selector<S, R>): R;
  all: (flows: Flow<S>[]) => Flow<S>;
  steps: (flows: Flow<S>[]) => Flow<S>;
}

export interface TrelaContextValue<S, A extends ApisBase> {
  apis: A;
  store: S;
  flows: Flow<S>[];
  affecters: Affecters<Effect<A, keyof A>>;
  dependencies: Map<Dependency["id"], Dependency>;
}

export type Affecter<E extends Effect<any, any>> = (
  effect: E,
  next: (effect: E) => void,
  done: CompliteFunc
) => void;

export type Affecters<E extends Effect<any, any>> = Record<
  EffectTypes,
  Affecter<E>
>;

export type Selector<S, R> = (state: S) => [R] | [R, boolean];

export type WrapApis<S, A extends ApisBase> = {
  [K in keyof A]: (...args: Parameters<A[K]>) => Flow<S>;
};

export type CompliteFunc = (effect: DefaultEffect) => void;

export type DefaultEffect = Effect<any, string>;

export type ResolveReturnType<F> = F extends (...args: any[]) => infer R
  ? R extends Promise<infer PR>
    ? PR
    : R
  : never;

export type EffectTypes = "request" | "resolve" | "done" | "cancel" | "error";

export type FlowStatus = "none" | "started" | "finished" | "cancel" | "error";
