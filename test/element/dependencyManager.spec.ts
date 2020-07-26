import { DependencyClass } from "@/elements/dependency";
import { DependencyManagerClass } from "@/elements/dependencyManager";

describe("DependencyManagerClass Tests", () => {
  let dependencyMg: DependencyManagerClass;

  interface Options {
    fn?: () => void;
    flowId?: number;
    children?: Options[];
  }

  const setup = (options: Options[]) => {
    options.forEach((option) => {
      const dep = dependencyMg.createDependency(option.fn || (() => void 0));

      dependencyMg.registerDependency(dep);

      if (option.flowId) {
        dep.bookUpdate(option.flowId);
      }

      setup(option.children || []);
      dependencyMg.updateDependency(dep);
    });
  };

  beforeEach(() => {
    dependencyMg = new DependencyManagerClass();
  });

  describe("tryUpdateView", () => {
    test("Execute updateComponentView function of Dependency that has passed flow id", () => {
      const flowId = 1;
      const updateMock = jest.fn();

      setup([{ flowId, fn: updateMock }, { fn: updateMock }]);

      dependencyMg.tryUpdateView(flowId);
      expect(updateMock).toBeCalledTimes(1);
    });

    test("Child Dependency does not execute updateComponentView function when parent updates", () => {
      const flowId = 1;
      const updateMock = jest.fn();

      setup([
        { flowId, children: [{ flowId, fn: updateMock }] },
        { children: [{}] },
      ]);

      dependencyMg.tryUpdateView(flowId);
      expect(updateMock).not.toBeCalled();
    });
  });

  describe("createDependency", () => {
    test("Return DependencyClass instance", () => {
      const dep = dependencyMg.createDependency(() => {});

      expect(dep).toBeInstanceOf(DependencyClass);
    });
  });

  describe("registerDependency", () => {
    test("Register depdency", () => {
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(dep);

      expect(dependencyMg["dependencies"].size).toEqual(1);
    });

    test("Update parents of dependency when the dependency has not yet registered", () => {
      const parentDep = dependencyMg.createDependency(() => {});
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(parentDep);
      dependencyMg.registerDependency(dep);

      expect(dep.parents.size).toBe(1);
      expect(dependencyMg["dependencies"].size).toEqual(2);
    });

    test("Does not update parents of dependency when already register the dependency", () => {
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(dep);
      expect(dep.parents.size).toBe(0);

      dependencyMg.registerDependency(dependencyMg.createDependency(() => {}));
      dependencyMg.registerDependency(dep);
      expect(dep.parents.size).toBe(0);
    });

    test("Execute init function of the passed dependency", () => {
      const dep = dependencyMg.createDependency(() => {});
      const initMock = jest.fn(dep.init);

      dep.init = initMock;

      dependencyMg.registerDependency(dep);
      expect(initMock).toBeCalledTimes(1);

      dependencyMg.registerDependency(dep);
      expect(initMock).toBeCalledTimes(2);
    });
  });

  describe("updateDependency", () => {
    test("Change didMount to true", () => {
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.updateDependency(dep);

      expect(dep.didMount).toBeTruthy();
    });

    test("Update parents of dependency when the dependency has registered", () => {
      const otherDep = dependencyMg.createDependency(() => {});
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(otherDep);
      dependencyMg.registerDependency(dep);
      dependencyMg.updateDependency(dep);
      dependencyMg.updateDependency(otherDep);

      expect(dep.parents.size).toBe(1);
      expect(otherDep.parents.size).toBe(0);
    });

    test("Deleted Dependency Parents do not update", () => {
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(dep);
      dependencyMg.updateDependency(dep);

      // Force Parents to be updated to see if it has changed
      dep.parents = new Map([[dep.id, dep]]);

      dependencyMg.deleteDependency(dep);
      dependencyMg.updateDependency(dep);

      expect(dep.parents.size).toBe(1);
      expect(dep.parents.get(dep.id)).toEqual(dep);
    });
  });

  describe("deleteDependency", () => {
    test("Delete dependency from dependencies of dependencyManager", () => {
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(dep);

      expect(dependencyMg["dependencies"].size).toEqual(1);

      dependencyMg.deleteDependency(dep);

      expect(dependencyMg["dependencies"].size).toEqual(0);
    });
  });
});
