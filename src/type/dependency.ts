import { Flow } from "./flow";
import { Selector } from "./util";

export interface Dependency {
  readonly id: string;

  didMount: boolean;
  selector: Selector<any, any>[];
  parents: Map<Dependency["id"], Dependency>;

  init(): void;
  updateComponentView(): void;
  bookUpdate(id: Flow<any, any>["id"]): void;
  updateParents(parents: Dependency["parents"]): void;
}

export interface DependencyManager {
  createDependency(updateComponentView: () => void): Dependency;
  registerDependency(dependency: Dependency): void;
  updateDependency(dependency: Dependency): void;
  deleteDependency(dependency: Dependency): void;
}
