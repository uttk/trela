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

  describe("tryUpdateView function", () => {
    test("Execute the passing updateView function", () => {
      const id = "test";

      dependency.tryUpdateView(id);
      expect(updateViewMock).not.toBeCalled();

      dependency.bookUpdate(id);
      dependency.didMount = true;
      dependency.tryUpdateView(id);
      expect(updateViewMock).toBeCalled();
    });

    test("Delete the passing id from bookUpdateIds", () => {
      const id = "test";

      dependency.bookUpdate(id);
      expect(dependency["bookUpdateIds"]).toHaveLength(1);
      expect(dependency["bookUpdateIds"]).toContain(id);

      dependency.tryUpdateView(id);
      expect(dependency["bookUpdateIds"]).toHaveLength(0);
      expect(dependency["bookUpdateIds"]).not.toContain(id);
    });
  });
});
