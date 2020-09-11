import { Dependency, DependencyId } from "./dependency";
import { Flow, FlowId } from "./flow";
import { ApisBase } from "./util";

export interface FlowStore {
  readonly flowKeys: Map<string, FlowId>;
  readonly flows: Map<FlowId, Flow<any>>;
}

export interface ApiStore<A extends ApisBase> {
  readonly apis: A;
  readonly apiKeys: Array<keyof A>;
}

export interface DependencyStore {
  readonly dependencies: Map<DependencyId, Dependency>;
}

export interface RelationStore {
  dependencyStore: DependencyStore;
  updateRelation: Map<FlowId, Set<DependencyId>>;
}
