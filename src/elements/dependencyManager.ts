import { DependencyClass } from "./dependency";
import { Flow, Dependency, DependencyManager } from "../type";

export class DependencyManagerClass implements DependencyManager {
  private counter: number = 0;
  private dependencies: Map<Dependency["id"], Dependency> = new Map();

  private filterWillMountDependencies(
    entries: Array<[Dependency["id"], Dependency]>
  ): Dependency["parents"] {
    return new Map(entries.filter(([, dep]) => !dep.didMount));
  }

  tryUpdateView(flowId: Flow<any, any>["id"]) {
    [...this.dependencies.values()]
      .reduce<Dependency[]>((list, dep) => {
        if (dep.parents.size) {
          let len = list.length;

          while (len--) {
            if (dep.isParent(list[len].id)) {
              return list;
            }
          }
        }

        return dep.canUpdate(flowId) ? list.concat(dep) : list;
      }, [])
      .forEach((dep) => dep.updateComponentView());
  }

  createDependency(updateComponentView: () => void): Dependency {
    return new DependencyClass(++this.counter, updateComponentView);
  }

  registerDependency(dependency: Dependency): void {
    if (!this.dependencies.has(dependency.id)) {
      dependency.updateParents(
        this.filterWillMountDependencies([...this.dependencies.entries()])
      );
    }

    dependency.init();
    this.dependencies.set(dependency.id, dependency);
  }

  updateDependency(dependency: Dependency): void {
    if (this.dependencies.has(dependency.id)) {
      dependency.updateParents(
        this.filterWillMountDependencies([...dependency.parents.entries()])
      );
    }

    dependency.didMount = true;

    this.dependencies.set(dependency.id, dependency);
  }

  deleteDependency(dependency: Dependency): void {
    this.dependencies.delete(dependency.id);
  }
}
