import { DependencyClass } from "../elements/DependencyClass";
import { DependencyManager, Dependency } from "../types";

// eslint-disable-next-line prettier/prettier
export class DependencyManagerClass implements DependencyManager {
  private counter: number = 0;
  private dependencies: Map<number, Dependency> = new Map();

  createDependency(updateView: () => void): Dependency {
    const id = ++this.counter;
    const dep = new DependencyClass(id, updateView);

    return dep;
  }

  registerDependency(dependency: Dependency) {
    if (!this.dependencies.has(dependency.id)) {
      const dependencies = [...this.dependencies.values()];
      const parents = dependencies.filter((dep) => !dep.didMount);

      dependency.setParents(parents);
    }

    dependency.setMount(false);

    this.dependencies.set(dependency.id, dependency);
  }

  updateDependency(dependency: Dependency) {
    if (this.dependencies.has(dependency.id)) {
      const parents = dependency.parents.filter((p) => !p.didMount);

      dependency.setParents(parents);
    }

    dependency.setMount(true);
    dependency.popUpdate();

    this.dependencies.set(dependency.id, dependency);
  }

  deleteDependency(dependency: Dependency) {
    this.dependencies.delete(dependency.id);
  }
}
