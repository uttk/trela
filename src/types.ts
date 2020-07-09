interface EffectPayload<F extends ApisBase[string]> {
  request: Parameters<F>;
  resolve: Parameters<F>;
  done: ResolveReturnType<F>;
  cancel: any;
  error: Error;
}

export type Effect<
  A extends ApisBase,
  E extends EffectTypes = EffectTypes
> = Readonly<CreateEffect<keyof A, A, E>>;

export type CreateEffect<
  AK extends keyof A,
  A extends ApisBase,
  E extends EffectTypes = EffectTypes
> = {
  type: E;
  request: AK;
  payload: EffectPayload<A[AK]>[E];
};

export interface ApisBase {
  [key: string]: (...args: any) => Promise<any>;
}

export interface ActionBase {
  type: string;
  payload: any;
}

export interface Dispacher {
  readonly id: string;
  status: FlowStatus;

  onComplite(callback: () => void): () => void;
  dispatch: (
    context: TrelaContextValue<any, any>,
    request: DispachRequest<FlowStatus>
  ) => void;
}

interface DispachPayload {
  none: void;
  started: void;
  cancel: any;
  error: Error;
  finished: any;
}

interface DispachRequest<S extends FlowStatus> {
  status: S;
  canDispach: boolean;
  payload: DispachPayload[S];
}

export type Dispach = <S extends FlowStatus>(
  request: DispachRequest<S>
) => void;

export interface Store<S, A extends ApisBase> {
  getState(): S;
  dispatch(action: CreateAction<keyof A, A>): void;
  subscribe(callback: (state: S) => void): () => void;
}

export interface Flow<S> {
  readonly id: string;

  start(): void;
  once(): [S, boolean];
  cancel(payload?: any): void;
  error(payload: Error): void;
  finish(payload?: any): void;
  forceStart(cancel?: boolean, payload?: any): void;
  addEventListener(event: FlowStatus, callback: () => void): () => void;
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
  dependencies: Map<Dependency["id"], Dependency>;
  affecters: Affecters<Effect<A>>;
}

export type Affecter<E extends Effect<any>> = (
  effect: E,
  next: (effect: E) => void,
  done: () => void
) => void;

export type Affecters<E extends DefaultEffect> = Record<
  EffectTypes,
  Affecter<E>
>;

export type Selector<S, R> = (state: S) => [R] | [R, boolean];

export type WrapApis<S, A extends ApisBase> = {
  [K in keyof A]: (...args: Parameters<A[K]>) => Flow<S>;
};

export type DefaultEffect = Effect<any>;

export type ResolveReturnType<F> = F extends (...args: any[]) => infer R
  ? R extends Promise<infer PR>
    ? PR
    : R
  : never;

export type EffectTypes = "request" | "resolve" | "done" | "cancel" | "error";

export type FlowStatus = "none" | "started" | "finished" | "cancel" | "error";

export type IsAction<T> = T extends ActionBase ? T : never;

export type CreateAction<AK, A extends ApisBase> = AK extends keyof A
  ? AK extends string
    ? IsAction<{ type: AK; payload: ResolveReturnType<A[AK]> }>
    : IsAction<{ type: AK; payload: A[AK] }>
  : never;

export type CreateActionsType<A extends ApisBase> = CreateAction<keyof A, A>;

export type FlowMethodKeys = keyof Omit<Flow<any>, "id">;

export type CreateDispach<S, A extends ApisBase> = (
  context: TrelaContextValue<S, A>,
  callbacks: Array<() => void>
) => Dispach;
