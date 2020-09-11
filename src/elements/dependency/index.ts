import { Dependency, DependencyId, DependencyStore } from "../../type";

export const createDependencyStore = (): DependencyStore => {
  return {
    dependencies: new Map(),
  };
};

export const createDependencyId = (() => {
  let count = 0;

  return () => count++;
})();

export const getDependencies = (
  store: DependencyStore,
  ids: DependencyId[]
): Dependency[] => {
  const { dependencies } = store;

  return ids.reduce<Dependency[]>((list, id) => {
    const dep = dependencies.get(id);

    return dep ? list.concat(dep) : list;
  }, []);
};

export const createDependency = (
  updateComponentView: () => void
): Dependency => {
  return {
    id: createDependencyId(),
    didMount: false,
    parents: new Map(),
    updateComponentView,
  };
};

export const filterWillMountDependencies = (
  entries: Array<[DependencyId, Dependency]>
): Dependency["parents"] => {
  return new Map(entries.filter(([, dep]) => !dep.didMount));
};

export const registerDependency = (
  store: DependencyStore,
  dependency: Dependency
) => {
  const depId = dependency.id;
  const { dependencies } = store;

  if (!dependencies.has(depId)) {
    dependency.parents = filterWillMountDependencies([
      ...dependencies.entries(),
    ]);
  }

  dependency.didMount = false;

  dependencies.set(depId, dependency);
};

export const updateDependency = (
  store: DependencyStore,
  dependency: Dependency
) => {
  const depId = dependency.id;
  const { dependencies } = store;

  if (dependencies.has(depId)) {
    dependency.parents = filterWillMountDependencies([
      ...dependency.parents.entries(),
    ]);
  }

  dependency.didMount = true;
  dependencies.set(depId, dependency);
};

export const deleteDependency = (
  store: DependencyStore,
  dependency: Dependency
) => {
  store.dependencies.delete(dependency.id);
};
