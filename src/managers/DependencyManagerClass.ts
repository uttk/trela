import { DependencyClass } from "../elements/DependencyClass";
import { DependencyManager, Dependency, Store } from "../types";

// eslint-disable-next-line prettier/prettier
export class DependencyManagerClass implements DependencyManager {
  private counter: number = 0;
  private store: Store<any, any>;
  private dependencies: Map<number, Dependency> = new Map();

  constructor(store: Store<any, any>) {
    this.store = store;
    this.store.subscribe((state) => {
      this.tryComponentUpdate((dep) => dep.isListenState(state));
    });
  }

  tryComponentUpdate(isUpdate: (dependency: Dependency) => boolean) {
    let deps = [...this.dependencies.values()];

    deps.sort((a, b) => (a.parents.length > b.parents.length ? 1 : -1));

    const updateDeps = deps.reduce<Dependency[]>((pre, dep) => {
      let len = pre.length;

      while (len--) {
        if (dep.isParent(pre[len])) {
          return pre;
        }
      }

      return isUpdate(dep) ? pre.concat(dep) : pre;
    }, []);

    updateDeps.forEach((dep) => dep.updateComponentView());
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

    dependency.selectors = [];
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
