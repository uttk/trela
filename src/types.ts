export interface Effect {
  type: "request" | "resolve" | "done" | "cancel" | "error";
  payload: any;
  request: string;
}

export interface ActionBase {
  type: string;
  payload: any;
}

export interface ApisBase {
  [key: string]: (...args: any) => Promise<any>;
}

export interface Stream {
  readonly id: string;

  send(type: Effect["type"], payload?: any): void;
  onComplite(callback: CompliteFunc): () => void;
  setAffecter(type: string, affecter: Affecter): void;
}

export interface Store<S, A extends ApisBase> {
  init(): void;
  getState(): S;
  dispatch(action: CreateAction<keyof A, A>): void;
  getOptions(): TrelaOptions<S, A>;
  subscribe(callback: Subscriber<S>): void;
}

export interface Streamer<S> {
  readonly id: string;

  forceStart(): void;
  error(error: Error): void;
  finish(payload?: any): void;
  cancel(payload?: any): void;
  start<R>(selector: Selector<S, R>): [R, boolean];
  addEventListener(status: StreamerStatus, cb: Listener): () => void;
}

export interface Dependency {
  id: number;
  didMount: boolean;
  parents: Dependency[];

  forceUpdate(): void;
  bookUpdate(id: string): void;
  canUpdate(id: string): boolean;
  setMount(mount: boolean): void;
  tryUpdateView(id: string): void;
  setParents(parents: Dependency[]): void;
}

export interface StreamerManager<S> {
  createStreamer(request: string, payload: any): Streamer<S>;
  createSeriesStreamer(streamers: Streamer<S>[]): Streamer<S>;
  createParallelStreamer(streamers: Streamer<S>[]): Streamer<S>;
}

export interface DependencyManager {
  deleteDependency(dependency: Dependency): void;
  updateDependency(dependency: Dependency): void;
  registerDependency(dependency: Dependency): void;
  createDependency(updateView: () => void): Dependency;
}

export interface TrelaOptions<S, A extends ApisBase> {
  apis?: A;
  affecters?: (store: Store<S, A>) => Partial<Affecters>;

  initState: S;
  reducer: TrelaReducer<S, A>;
}

export interface TrelaApis<S, A extends ApisBase> {
  apis: WrapApis<S, A>;
  getState<R>(selector: (state: S) => [R] | [R, boolean]): R;
  all: (streamers: Streamer<S>[]) => Streamer<S>;
  steps: (streamers: Streamer<S>[]) => Streamer<S>;
}

export interface TrelaContextValue<S, A extends ApisBase> {
  store: Store<S, A>;
  streamerMg: StreamerManager<S>;
  dependencyMg: DependencyManager;
}

type Listener = (payload?: any) => void;

type ResolveReturnType<F> = F extends (...args: any[]) => infer R
  ? R extends Promise<infer PR>
    ? PR
    : R
  : never;

type IsAction<T> = T extends ActionBase ? T : never;

export type CreateAction<AK, A extends ApisBase> = AK extends keyof A
  ? AK extends string
    ? IsAction<{ type: AK; payload: ResolveReturnType<A[AK]> }>
    : IsAction<{ type: AK; payload: A[AK] }>
  : never;

export type CreateActionsType<A extends ApisBase> = CreateAction<keyof A, A>;

export type StreamerStatus =
  | "none"
  | "once"
  | "started"
  | "finished"
  | "cancel"
  | "error";

export type Subscriber<S> = (state: S) => void;

export type CompliteFunc = (effect: Effect) => void;

export type WrapApis<S, A extends ApisBase> = {
  [K in keyof A]: (...args: Parameters<A[K]>) => Streamer<S>;
};

export type Selector<S, R> = (state: S) => R;

export type TrelaReducer<S, A extends ApisBase> = (
  state: S,
  action: CreateAction<keyof A, A>
) => S;

export type Affecter = (
  effect: Effect,
  next: (effect: Effect) => void,
  done: CompliteFunc
) => void;

export type Affecters = Record<Effect["type"], Affecter>;
