import { DependencyClass } from "../elements/DependencyClass";
import { DependencyManager, Dependency, Store } from "../types";

// eslint-disable-next-line prettier/prettier
export class DependencyManagerClass implements DependencyManager {
  private counter: number = 0;
  private store: Store<any, any>;
  private dependencies: Map<number, Dependency> = new Map();

  constructor(store: Store<any, any>) {
    this.store = store;
    this.store.subscribe(this.notifyStoreUpdate.bind(this));
  }

  private notifyStoreUpdate(state: any) {
    let deps = Array.from(this.dependencies.values());

    while (deps.length > 0) {
      const dep = deps.shift();

      if (dep && dep.isListenState(state)) {
        dep.updateComponentView();
        deps = deps.filter((d) => !d.isParent(dep));
      }
    }
  }

  createDependency(updateView: () => void): Dependency {
    const id = ++this.counter;
    const dep = new DependencyClass(id, updateView);

    return dep;
  }

  registerDependency(dependency: Dependency) {
    if (!this.dependencies.has(dependency.id)) {
      const dependencies = [...this.dependencies.values()];
      const parents = dependencies.filter((dep) => !dep.didMount);

      dependency.parents = parents;
    }

    dependency.didMount = false;

    this.dependencies.set(dependency.id, dependency);
  }

  updateDependency(dependency: Dependency) {
    if (this.dependencies.has(dependency.id)) {
      const parents = dependency.parents.filter((p) => !p.didMount);

      dependency.parents = parents;
    }

    dependency.didMount = true;

    this.dependencies.set(dependency.id, dependency);
  }

  deleteDependency(dependency: Dependency) {
    this.dependencies.delete(dependency.id);
  }
}
