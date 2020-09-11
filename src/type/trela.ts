import { FunctionComponent, SuspenseProps } from "react";
import { FlowApi, FlowDispatch, GetFlowApiResultList } from "./flow";
import { ApiStore, DependencyStore, FlowStore, RelationStore } from "./store";
import { ApisBase, ResolvePromise } from "./util";

export enum TrelaMode {
  conventional = 0,
  concurrent,
}

export interface TrelaContextValue<A extends ApisBase> {
  readonly mode: TrelaMode;

  readonly apiStore: ApiStore<A>;
  readonly flowStore: FlowStore;
  readonly dependencyStore: DependencyStore;

  readonly dispatch: FlowDispatch;
}

export interface TrelaContext<A extends ApisBase> {
  Provider: FunctionComponent;
  useTrela: () => TrelaApi<A>;
}

export interface TrelaContextOptions<A extends ApisBase> {
  apis: A;
}

export type TrelaWrapApis<A extends ApisBase> = {
  // eslint-disable-next-line prettier/prettier
  [K in keyof A]: (...args: Parameters<A[K]>) => FlowApi<ResolvePromise<A[K]> | null>;
};

export interface TrelaApi<A extends ApisBase> {
  apis: TrelaWrapApis<A>;

  // eslint-disable-next-line prettier/prettier
  all: <F extends readonly FlowApi<any>[]>(flows: [...F]) => FlowApi<[...GetFlowApiResultList<F>] | null>;

  // eslint-disable-next-line prettier/prettier
  steps: <F extends readonly FlowApi<any>[]>(flows: [...F]) => FlowApi<[...GetFlowApiResultList<F>] | null>;
}

export interface TrelaDispatchContext {
  flowStore: FlowStore;
  relationStore: RelationStore;
  dependencyStore: DependencyStore;
}
