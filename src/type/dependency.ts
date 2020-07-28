import { Flow } from "./flow";
import { Selector } from "./util";

export interface Dependency<S> {
  readonly id: number;
  readonly updateComponentView: () => void;

  didMount: boolean;
  selectors: Set<Selector<any, any>>;
  parents: Map<Dependency<S>["id"], Dependency<S>>;

  init(): void;
  isListenState(state: S): boolean;
  isParent(id: Dependency<S>["id"]): boolean;
  bookUpdate(id: Flow<any, any>["id"]): void;
  hasFlowId(flowId: Flow<any, any>["id"]): boolean;
  canUpdate(flowId: Flow<any, any>["id"]): boolean;
  updateParents(parents: Dependency<S>["parents"]): void;
}

export interface DependencyManager<S> {
  tryUpdateView(flow: Flow<S, any>): void;
  createDependency(updateComponentView: () => void): Dependency<S>;
  registerDependency(dependency: Dependency<S>): void;
  updateDependency(dependency: Dependency<S>): void;
  deleteDependency(dependency: Dependency<S>): void;
}
