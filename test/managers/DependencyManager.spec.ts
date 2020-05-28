import { DependencyClass } from "../../src/elements/DependencyClass";
import { DependencyManagerClass } from "../../src/managers/DependencyManagerClass";

describe("DependencyManagerClass Tests", () => {
  let dependencyMg: DependencyManagerClass;

  beforeEach(() => {
    dependencyMg = new DependencyManagerClass();
  });

  describe("createDependency function", () => {
    test("Return DependencyClass instance", () => {
      const dep = dependencyMg.createDependency(() => {});

      expect(dep).toBeInstanceOf(DependencyClass);
    });
  });

  describe("registerDependency function", () => {
    test("Register depdency", () => {
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(dep);

      expect(dependencyMg["dependencies"].size).toEqual(1);
    });

    test("Set elements of dependency when the dependency has not yet registered", () => {
      const parentDep = dependencyMg.createDependency(() => {});
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(parentDep);
      dependencyMg.registerDependency(dep);

      expect(dep.parents).toHaveLength(1);
      expect(dep.didMount).toBeFalsy();
      expect(dependencyMg["dependencies"].size).toEqual(2);
    });
  });

  describe("updateDependency function", () => {
    test("Updates the passed dependency element", () => {
      const otherDep = dependencyMg.createDependency(() => {});
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(otherDep);
      dependencyMg.registerDependency(dep);

      dependencyMg.updateDependency(otherDep);
      dependencyMg.updateDependency(dep);

      expect(dep.didMount).toBeTruthy();
      expect(dep.parents).toHaveLength(0);
    });
  });

  describe("deleteDependency function", () => {
    test("Delete dependency from dependencies of dependencyManager", () => {
      const dep = dependencyMg.createDependency(() => {});

      dependencyMg.registerDependency(dep);

      expect(dependencyMg["dependencies"].size).toEqual(1);

      dependencyMg.deleteDependency(dep);

      expect(dependencyMg["dependencies"].size).toEqual(0);
    });
  });
});
