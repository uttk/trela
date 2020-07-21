import { Dependency } from "./dependency";
import { ApisBase, ResolvePromise, CreateFlowRequest } from "./util";

interface FlowBase<S> {
  readonly id: string;
  state: S;
  status: FlowStatus;
}

export type FlowStatus =
  | "request"
  | "resolve"
  | "finished"
  | "cancel"
  | "error";

export interface RequestFlow<S, A extends ApisBase> extends FlowBase<S> {
  status: "request";
  payload: CreateFlowRequest<A, keyof A> | Flow<S, A>[];
}

export interface ResolveFlow<S, A extends ApisBase> extends FlowBase<S> {
  status: "resolve";
  payload: CreateFlowRequest<A, keyof A>;
}

export interface FinishFlow<S, A extends ApisBase> extends FlowBase<S> {
  status: "finished";
  payload: ResolvePromise<A[keyof A]>;
}

export interface CancelFlow<S> extends FlowBase<S> {
  status: "cancel";
  payload: string;
}

export interface ErrorFlow<S> extends FlowBase<S> {
  status: "error";
  payload: Error;
}

export interface Flows<S, A extends ApisBase> {
  request: RequestFlow<S, A>;
  resolve: ResolveFlow<S, A>;
  finished: FinishFlow<S, A>;
  cancel: CancelFlow<S>;
  error: ErrorFlow<S>;
}

export type Flow<S, A extends ApisBase> = Flows<S, A>[FlowStatus];

export interface FlowApi<S> {
  once(): [S, boolean];
  start(): void;
  forceStart(): void;
  cancel(): void;
  error(error: Error): void;
}

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
