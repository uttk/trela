import { Store } from "./store";
import { ApisBase, Reducer, Selector } from "./util";
import { Dependency, DependencyManager } from "./dependency";
import {
  Flow,
  FlowApi,
  FlowStatus,
  FlowRequest,
  FlowManager,
  FlowWrapApis,
} from "./flow";

export interface TrelaContextValue<S, A extends ApisBase> {
  readonly isDefault?: boolean;

  apis: A;
  store: Store<S, A>;
  flowMg: FlowManager<S, A>;
  dependencyMg: DependencyManager;
}

export type Setup<S, A extends ApisBase> = (
  flow: Flow<S, A>,
  dependency: Dependency
) => void;

export interface ContextOptions<S, A extends ApisBase> {
  apis: A;
  initState: S;
  setup: Setup<S, A>;
  reducer: Reducer<S, A>;
}

export interface TrelaApi<S, A extends ApisBase> {
  apis: FlowWrapApis<S, A>;
  all(flow: Flow<S, A>[]): FlowApi<S>;
  steps(flow: Flow<S, A>[]): FlowApi<S>;
  getState<R>(selector: Selector<S, R>): R;
}

export {
  Flow,
  Store,
  FlowApi,
  ApisBase,
  Selector,
  Dependency,
  FlowStatus,
  FlowRequest,
  FlowManager,
  FlowWrapApis,
};
