import { DependencyClass } from "@/elements/dependency";

describe("DependencyClass Tests", () => {
  let dependency: DependencyClass<any>;
  let updateViewMock: jest.Mock;

  beforeEach(() => {
    updateViewMock = jest.fn();
    dependency = new DependencyClass(0, updateViewMock);
  });

  describe("init", () => {
    test("Initialize properties", () => {
      dependency.didMount = true;
      dependency.selectors.add((state) => [state]);
      expect(dependency.didMount).toBeTruthy();
      expect(dependency.selectors.size).toBe(1);

      dependency.init();
      expect(dependency.didMount).toBeFalsy();
      expect(dependency.selectors.size).toBe(0);
    });
  });

  describe("updateParents", () => {
    test("Can update parents property", () => {
      const parents: DependencyClass<any>["parents"] = new Map();

      expect(dependency.parents).not.toBe(parents);

      dependency.updateParents(parents);
      expect(dependency.parents).toBe(parents);
    });
  });

  describe("canUpdate", () => {
    test("Returns the result of whether it can be updated", () => {
      const id = 0;

      expect(dependency.canUpdate(id)).toBeFalsy();

      dependency.didMount = true;
      expect(dependency.canUpdate(id)).toBeFalsy();

      dependency.bookUpdate(id);
      expect(dependency.canUpdate(id)).toBeTruthy();
    });

    test("it returns a false when the parent updates", () => {
      const id = 0;
      const parents = new Map();
      const parent = new DependencyClass(1, () => {});

      parents.set(1, parent);
      parents.set(2, parent);

      dependency.bookUpdate(id);
      dependency.didMount = true;
      dependency.updateParents(parents);
      expect(dependency.canUpdate(id)).toBeTruthy();

      parent.bookUpdate(id);
      parent.didMount = true;
      expect(dependency.canUpdate(id)).toBeFalsy();

      parent.didMount = false;
      expect(dependency.canUpdate(id)).toBeTruthy();
    });
  });

  describe("bookUpdate", () => {
    test("Add the passed id to bookingFlowIds", () => {
      const flowId = 0;
      const flowId2 = 1;

      dependency.bookUpdate(flowId);
      expect(dependency["bookingFlowIds"]).toHaveLength(1);
      expect(dependency["bookingFlowIds"]).toContain(flowId);

      dependency.bookUpdate(flowId2);
      expect(dependency["bookingFlowIds"]).toHaveLength(2);
      expect(dependency["bookingFlowIds"]).toContain(flowId2);
    });
  });

  describe("isParent", () => {
    test("Determine if the passed Dependency is a parent", () => {
      const parent = new DependencyClass(111, () => void 0);
      const other = new DependencyClass(11, () => void 0);

      dependency.updateParents(new Map([[parent.id, parent]]));

      expect(dependency.isParent(other.id)).toBeFalsy();
      expect(dependency.isParent(parent.id)).toBeTruthy();
    });
  });

  describe("isListenState", () => {
    test("Returns true when selector returns True", () => {
      const selectorMoc: (v: any) => [any, true] = jest.fn((s) => [s, true]);

      dependency.selectors.add(selectorMoc);
      expect(dependency.isListenState(null)).toBeTruthy();
      expect(selectorMoc).toBeCalledTimes(1);
    });

    test("Returns true if at least one is true", () => {
      const trueMock: () => [any, true] = jest.fn(() => [null, true]);
      const falseMock: () => [any, false] = jest.fn(() => [null, false]);

      dependency.selectors.add(falseMock);
      dependency.selectors.add(trueMock);
      dependency.selectors.add(falseMock);

      dependency.isListenState(null);

      expect(trueMock).toBeCalledTimes(1);
      // Does not execute after true is determined,
      // So it is only executed first
      expect(falseMock).toBeCalledTimes(1);
    });

    test("Returns false when all selectors return false", () => {
      const selectorMoc: (v: any) => [any, false] = jest.fn((s) => [s, false]);

      dependency.selectors.add(selectorMoc);
      expect(dependency.isListenState(null)).toBeFalsy();
      expect(selectorMoc).toBeCalledTimes(1);
    });

    test("Returns false in default", () => {
      expect(dependency.isListenState(null)).toBeFalsy();
    });

    test("Execute all registered selectors", () => {
      const selectorMoc = new Array(10).fill(0).map(() => {
        const selector: (v: any) => [any, false] = jest.fn((s) => [s, false]);

        dependency.selectors.add(selector);

        return selector;
      });

      dependency.isListenState(null);
      selectorMoc.forEach((selector) => {
        expect(selector).toBeCalledTimes(1);
      });
    });
  });
});
