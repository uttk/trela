import { DependencyClass } from "../../src/elements/dependency";

describe("DependencyClass Tests", () => {
  let dependency: DependencyClass;
  let updateViewMock: jest.Mock;

  beforeEach(() => {
    updateViewMock = jest.fn();
    dependency = new DependencyClass(0, updateViewMock);
  });

  describe("init function", () => {
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
      const parents: DependencyClass["parents"] = new Map();

      expect(dependency.parents).not.toBe(parents);

      dependency.updateParents(parents);
      expect(dependency.parents).toBe(parents);
    });
  });

  describe("canUpdate function", () => {
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

  describe("bookUpdate function", () => {
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

  describe("isParent function", () => {
    test("Determine if the passed Dependency is a parent", () => {
      const parent = new DependencyClass(111, () => void 0);
      const other = new DependencyClass(11, () => void 0);

      dependency.updateParents(new Map([[parent.id, parent]]));

      expect(dependency.isParent(other.id)).toBeFalsy();
      expect(dependency.isParent(parent.id)).toBeTruthy();
    });
  });
});
