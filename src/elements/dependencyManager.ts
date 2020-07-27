import { DependencyClass } from "./dependency";
import { Flow, Dependency, DependencyManager } from "../type";

export class DependencyManagerClass<S> implements DependencyManager<S> {
  private counter: number = 0;
  private dependencies: Map<Dependency<S>["id"], Dependency<S>> = new Map();

  private filterWillMountDependencies(
    entries: Array<[Dependency<S>["id"], Dependency<S>]>
  ): Dependency<S>["parents"] {
    return new Map(entries.filter(([, dep]) => !dep.didMount));
  }

  tryUpdateView(flow: Flow<S, any>) {
    const flowId = flow.id;
    const state = flow.getStore().getState();
    const deps = [...this.dependencies.values()].reduce<Dependency<S>[]>(
      (list, dep) => {
        if (dep.parents.size) {
          let len = list.length;

          while (len--) {
            if (dep.isParent(list[len].id)) {
              return list;
            }
          }
        }

        const isUpdate = dep.isListenState(state) || dep.canUpdate(flowId);

        return isUpdate ? list.concat(dep) : list;
      },
      []
    );

    deps.forEach((dep) => dep.updateComponentView());
  }

  createDependency(updateComponentView: () => void): Dependency<S> {
    return new DependencyClass(++this.counter, updateComponentView);
  }

  registerDependency(dependency: Dependency<S>): void {
    if (!this.dependencies.has(dependency.id)) {
      dependency.updateParents(
        this.filterWillMountDependencies([...this.dependencies.entries()])
      );
    }

    dependency.init();
    this.dependencies.set(dependency.id, dependency);
  }

  updateDependency(dependency: Dependency<S>): void {
    if (this.dependencies.has(dependency.id)) {
      dependency.updateParents(
        this.filterWillMountDependencies([...dependency.parents.entries()])
      );
    }

    dependency.didMount = true;

    this.dependencies.set(dependency.id, dependency);
  }

  deleteDependency(dependency: Dependency<S>): void {
    this.dependencies.delete(dependency.id);
  }
}
