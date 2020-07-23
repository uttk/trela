import { Store } from "./store";
import { ApisBase } from "./util";
import { Dependency } from "./dependency";

export type FlowStatus = "none" | "started" | "finished" | "cancel" | "error";

export interface Flow<S, A extends ApisBase> {
  readonly id: number;
  currentError: Error;
  status: FlowStatus;

  getStore(): Store<S, A>;
  once(): void;
  start(): void;
  cancel(): void;
  complete(): void;
  forceStart(): void;
  error(error: Error): void;
  addEventCallback(type: FlowStatus, callback: () => void): () => void;
}

export interface FlowApi<S> {
  readonly id: Flow<S, any>["id"];

  once(): [S, boolean];
  start(): void;
  cancel(): void;
  forceStart(): void;
  error(payload: Error): void;
}

export type FlowRequest<S, A extends ApisBase> = (flow: Flow<S, A>) => void;

export type FlowWrapApis<S, A extends ApisBase> = {
  [K in keyof A]: () => FlowApi<S>;
};

export interface FlowManager<S, A extends ApisBase> {
  createFlowApi(flow: Flow<S, A>, dependency: Dependency): FlowApi<S>;

  createSeriesFlow(flowList: Flow<S, A>[]): Flow<S, A>;
  createParallelFlow(flowList: Flow<S, A>[]): Flow<S, A>;
  // eslint-disable-next-line prettier/prettier
  createFlow<AK extends keyof A>(request: AK, payload: Parameters<A[AK]>): Flow<S, A>;
}
