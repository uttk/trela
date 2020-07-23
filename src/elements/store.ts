import {
  Store,
  Reducer,
  ApisBase,
  CreateAction,
  ContextOptions,
} from "../type";

export class StoreClass<S, A extends ApisBase> implements Store<S, A> {
  private apis: A;
  private state: S;
  private apiKeys: Array<keyof A>;
  private reducer: Reducer<S, A>;
  private listeners: Set<(state: S) => void> = new Set();

  constructor(options: ContextOptions<S, A>) {
    this.apis = options.apis;
    this.reducer = options.reducer;
    this.state = options.initState;
    this.apiKeys = Object.keys(options.apis);
  }

  getApiKeys(): Readonly<Array<keyof A>> {
    return this.apiKeys;
  }

  getState(): S {
    return this.state;
  }

  getApi<AK extends keyof A>(key: AK): A[AK] {
    return this.apis[key];
  }

  updateState(state: S): void {
    this.state = state;
    this.listeners.forEach((f) => f(state));
  }

  subscribe(callback: (state: S) => void): () => void {
    this.listeners.add(callback);

    return () => this.listeners.delete(callback);
  }

  dispatch<AK extends keyof A>(action: CreateAction<A, AK>): void {
    this.state = this.reducer(this.state, action);
  }
}
