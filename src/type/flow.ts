import { Store } from "./store";
import { ApisBase } from "./util";

export type FlowStatus = "none" | "started" | "finished" | "cancel" | "error";

export interface Flow<S, A extends ApisBase> {
  readonly id: number;
  currentError: Error;
  status: FlowStatus;

  getStore(): Store<S, A>;
  start(): void;
  cancel(): void;
  complete(): void;
  error(payload?: Error): void;
  addEventListener(type: FlowStatus, callback: () => void): () => void;
}

export interface FlowApi<S> {
  readonly id: Flow<S, any>["id"];

  once(): [S, boolean];
  start(): void;
  cancel(): void;
  forceStart(): void;
  error(payload?: Error): void;
  addEventListener(type: FlowStatus, callback: () => void): () => void;
}

export type FlowRequest<S, A extends ApisBase> = (flow: Flow<S, A>) => void;

export type FlowWrapApis<S, A extends ApisBase> = {
  [K in keyof A]: () => FlowApi<S>;
};

export interface FlowManager<S, A extends ApisBase> {
  createId(flowId: string): number;
  getFlowFromApi(flowApi: FlowApi<S>): Flow<S, A>;
  getFlow(flowId: Flow<S, A>["id"]): Flow<S, A> | void;
  createFlow(id: number, request: FlowRequest<S, A>): Flow<S, A>;
}
