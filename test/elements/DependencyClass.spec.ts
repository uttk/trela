import { DependencyClass } from "../../src/elements/DependencyClass";

describe("DependencyClass Tests", () => {
  let dependency: DependencyClass;
  let updateViewMock: jest.Mock;

  beforeEach(() => {
    updateViewMock = jest.fn();
    dependency = new DependencyClass(0, updateViewMock);
  });

  describe("canUpdate function", () => {
    test("Returns the result of whether it can be updated", () => {
      const id = "test";
      expect(dependency.canUpdate(id)).toBeFalsy();

      dependency.didMount = true;
      expect(dependency.canUpdate(id)).toBeFalsy();

      dependency.bookUpdate(id);
      expect(dependency.canUpdate(id)).toBeTruthy();
    });

    test("it returns a false when the parent updates", () => {
      const id = "test";
      const parent = new DependencyClass(1, () => {});

      dependency.bookUpdate(id);
      dependency.didMount = true;
      dependency.parents = [parent];
      expect(dependency.canUpdate(id)).toBeTruthy();

      parent.bookUpdate(id);
      parent.didMount = true;
      expect(dependency.canUpdate(id)).toBeFalsy();

      parent.didMount = false;
      expect(dependency.canUpdate(id)).toBeTruthy();
    });
  });

  describe("bookUpdate function", () => {
    test("Add the passed id to bookUpdateIds", () => {
      dependency.bookUpdate("test");
      expect(dependency["bookUpdateIds"]).toHaveLength(1);
      expect(dependency["bookUpdateIds"]).toContain("test");

      dependency.bookUpdate("test2");
      expect(dependency["bookUpdateIds"]).toHaveLength(2);
      expect(dependency["bookUpdateIds"]).toContain("test2");
    });
  });

  describe("isParent function", () => {
    test("Determine if the passed Dependency is a parent", () => {
      const parent = new DependencyClass(111, () => void 0);
      const other = new DependencyClass(11, () => void 0);

      dependency.parents.push(parent);

      expect(dependency.isParent(other)).toBeFalsy();
      expect(dependency.isParent(parent)).toBeTruthy();
    });
  });

  describe("isListenState function", () => {
    test("returns false if there is no selector", () => {
      expect(dependency.isListenState(0)).toBeFalsy();
    });

    test("Executes the added selector and returns a Boolean from the result", () => {
      const args = 0;
      const firstSelector = jest.fn<[number], any[]>(() => [0]);

      dependency.selectors.push(firstSelector);

      expect(dependency.isListenState(args)).toBeFalsy();
      expect(firstSelector).toBeCalled();
      expect(firstSelector).toBeCalledWith(args);

      const secondSelector = jest.fn<[number, boolean], any[]>(() => [0, true]);
      dependency.selectors.push(secondSelector);

      expect(dependency.isListenState(args)).toBeTruthy();
      expect(secondSelector).toBeCalled();
      expect(secondSelector).toBeCalledWith(args);
    });
  });
});
