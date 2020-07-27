import { Store } from "./store";
import { Dependency, DependencyManager } from "./dependency";
import {
  Reducer,
  ApisBase,
  Selector,
  CreateAction,
  CreateActionsType,
} from "./util";
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

  store: Store<S, A>;
  flowMg: FlowManager<S, A>;
  dependencyMg: DependencyManager<S>;
}

export type Setup<S, A extends ApisBase> = (
  flow: Flow<S, A>,
  dependency: Dependency<S>
) => void;

export interface ContextOptions<S, A extends ApisBase> {
  apis: A;
  initState: S;
  reducer: Reducer<S, A>;
  errorHandle?: (
    state: S,
    action: { type: keyof A; error: Error }
  ) => S | Error;
}

export interface TrelaApi<S, A extends ApisBase> {
  apis: FlowWrapApis<S, A>;
  all(flow: FlowApi<S>[]): FlowApi<S>;
  steps(flow: FlowApi<S>[]): FlowApi<S>;
  getState<R>(selector: Selector<S, R>): R;
}

export {
  Flow,
  Store,
  Reducer,
  FlowApi,
  ApisBase,
  Selector,
  Dependency,
  FlowStatus,
  FlowRequest,
  FlowManager,
  FlowWrapApis,
  CreateAction,
  CreateActionsType,
  DependencyManager,
};
