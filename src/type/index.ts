import { Store } from "./store";
import { ApisBase, Reducer, Selector } from "./util";
import { Dependency, DependencyManager } from "./dependency";
import {
  Flow,
  Flows,
  FlowApi,
  FlowStatus,
  FlowManager,
  FlowWrapApis,
} from "./flow";

type Affect<S, A extends ApisBase, FS extends FlowStatus> = (
  payload: Flows<S, A>[FS],
  next: (flow: Flow<S, A>) => void,
  done: (flow: Flow<S, A>) => void
) => void;

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
