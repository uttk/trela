import { DependencyManager, Dependency } from "../type/dependency";
import { DependencyClass } from "./dependency";

export class DependencyManagerClass implements DependencyManager {
  private counter: number = 0;
  private dependencies: Map<Dependency["id"], Dependency> = new Map();

  private filterParents(
    entries: Array<[Dependency["id"], Dependency]>
  ): Dependency["parents"] {
    return new Map(entries.filter(([, dep]) => !dep.didMount));
  }

  createDependency(updateComponentView: () => void): Dependency {
    return new DependencyClass(++this.counter, updateComponentView);
  }

  registerDependency(dependency: Dependency): void {
    if (!this.dependencies.has(dependency.id)) {
      dependency.updateParents(
        this.filterParents([...this.dependencies.entries()])
      );
    }

    dependency.init();
    this.dependencies.set(dependency.id, dependency);
  }

  updateDependency(dependency: Dependency): void {
    if (this.dependencies.has(dependency.id)) {
      dependency.updateParents(
        this.filterParents([...dependency.parents.entries()])
      );
    }

    dependency.didMount = true;

    this.dependencies.set(dependency.id, dependency);
  }

  deleteDependency(dependency: Dependency): void {
    this.dependencies.delete(dependency.id);
  }
}
