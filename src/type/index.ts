import { Dependency, DependencyManager } from "./dependency";
import {
  Flow,
  FlowApi,
  FlowStatus,
  FlowRequest,
  FlowManager,
  FlowWrapApis,
} from "./flow";
import { Store } from "./store";
import {
  Reducer,
  ApisBase,
  Selector,
  CreateAction,
  CreateActionsType,
} from "./util";

export interface TrelaContextValue<S, A extends ApisBase> {
  readonly isDefault?: boolean;

  apis: A;
  store: Store<S, A>;
  flowMg: FlowManager<S, A>;
  dependencyMg: DependencyManager<S>;
  utils: {
    setup: Setup<S, A>;
    // eslint-disable-next-line prettier/prettier
    createFlowApi: (flow: Flow<S, A>, setup: () => void) => FlowApi<S>;

    // requests
    createSeriesRequest(flowApis: FlowApi<S>[]): FlowRequest<S, A>;
    createParallelRequest: (flowApis: FlowApi<S>[]) => FlowRequest<S, A>;
    // eslint-disable-next-line prettier/prettier
    createApiRequest: <AK extends keyof A>(request: AK, payload: Parameters<A[AK]>) => FlowRequest<S, A>;
  };
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
