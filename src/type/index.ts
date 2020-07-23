import { Store } from "./store";
import { ApisBase, Reducer, Selector } from "./util";
import { Dependency, DependencyManager } from "./dependency";
import {
  Flow,
  Affect,
  FlowApi,
  FlowStatus,
  FlowManager,
  FlowWrapApis,
} from "./flow";

export interface TrelaContextValue<S, A extends ApisBase> {
  readonly isDefault?: boolean;

  apis: A;
  store: Store<S, A>;
  flowMg: FlowManager<S, A>;
  dependencyMg: DependencyManager;
  affecters: {
    [K in FlowStatus]: Affect<S, A, K>;
  };
}

export interface ContextOptions<S, A extends ApisBase> {
  apis: A;
  initState: S;
  reducer: Reducer<S, A>;
}

export interface TrelaApi<S, A extends ApisBase> {
  apis: FlowWrapApis<S, A>;
  all(flow: Flow<S, A>[]): FlowApi<S>;
  steps(flow: Flow<S, A>[]): FlowApi<S>;
  getState<R>(selector: Selector<S, R>): R;
}

export { ApisBase, Selector, Dependency, FlowWrapApis };
