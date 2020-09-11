import { DependencyId } from "./dependency";
import { ExcludeNull, PromiseCreator } from "./util";

export type FlowTypes = "api" | "series" | "parallel";

export type FlowActionTypes = "none" | "read" | "start" | "cancel";

export type FlowId = number;

export interface Flow<R> {
  id: FlowId;
  result: R | null;
  isFirst: boolean;
  isProgress: boolean;
  promise: Promise<R | null> | null;

  cancel: (() => void) | null;
  createPromise: PromiseCreator<R | null>;
}

export interface FlowRequest<R> {
  id: FlowId;
  action: FlowActionTypes;
  fromDependency: DependencyId | null;
  createPromise: PromiseCreator<R>;
}

export interface FlowApi<R, D = ExcludeNull<R>> {
  readonly id: FlowId;

  default(defaultValue: D): Omit<FlowApi<D>, "default">;

  read(): [R, boolean];
  start(): void;
  cancel(): void;
  getRequest: () => FlowRequest<R>;

  only: {
    read(): [R, boolean];
    start(): void;
    cancel(): void;
  };
}

export type DefaultFlowApi = FlowApi<any>;

export type FlowDispatch = <R>(request: FlowRequest<R>) => Flow<R>;

export type GetFlowResult<F> = F extends Flow<infer T> ? T : never;

export type GetFlowApiResultList<FL extends readonly DefaultFlowApi[]> = {
  [K in keyof FL]: ExcludeNull<FL[K] extends FlowApi<infer R> ? R : never>;
};

export type GetFlowResultList<FL extends readonly Flow<any>[]> = {
  [K in keyof FL]: GetFlowResult<FL[K]>;
};
