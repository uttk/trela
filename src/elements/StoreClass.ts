import {
  Store,
  ApisBase,
  Subscriber,
  TrelaReducer,
  TrelaOptions,
  CreateAction,
} from "../types";

// eslint-disable-next-line prettier/prettier
export class StoreClass<S, A extends ApisBase> implements Store<S, A> {
  private readonly options: TrelaOptions<S, A>;

  private state: S;
  private subscribers: Subscriber<S>[] = [];
  private reducer: TrelaReducer<S, A>;

  constructor(options: TrelaOptions<S, A>) {
    this.options = options;
    this.state = options.initState;
    this.reducer = options.reducer;
  }

  private notifyUpdated() {
    this.subscribers.forEach((cb) => cb(this.state));
  }

  init() {
    this.state = this.options.initState;
  }

  getState() {
    return this.state;
  }

  getOptions() {
    return this.options;
  }

  subscribe(callback: Subscriber<S>) {
    this.subscribers = this.subscribers.concat(callback);

    return () => {
      this.subscribers = this.subscribers.filter((f) => f !== callback);
    };
  }

  dispatch(action: CreateAction<keyof A, A>) {
    const newState = this.reducer(this.state, action);

    if (newState !== this.state) {
      this.state = newState;
      this.notifyUpdated();
    }
  }
}
