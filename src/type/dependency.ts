import { Flow } from "./flow";
import { Selector } from "./util";

export interface Dependency {
  readonly id: number;
  readonly updateComponentView: () => void;

  didMount: boolean;
  selectors: Set<Selector<any, any>>;
  parents: Map<Dependency["id"], Dependency>;

  init(): void;
  isParent(id: Dependency["id"]): boolean;
  bookUpdate(id: Flow<any, any>["id"]): void;
  hasFlowId(flowId: Flow<any, any>["id"]): boolean;
  canUpdate(flowId: Flow<any, any>["id"]): boolean;
  updateParents(parents: Dependency["parents"]): void;
}

export interface DependencyManager {
  tryUpdateView(flowId: Flow<any, any>["id"]): void;
  createDependency(updateComponentView: () => void): Dependency;
  registerDependency(dependency: Dependency): void;
  updateDependency(dependency: Dependency): void;
  deleteDependency(dependency: Dependency): void;
}
