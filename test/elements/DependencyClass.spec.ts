import { DependencyClass } from "../../src/elements/DependencyClass";

import { Dependency } from "../../src/types";

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

      dependency.setMount(true);
      expect(dependency.canUpdate(id)).toBeFalsy();

      dependency.bookUpdate(id);
      expect(dependency.canUpdate(id)).toBeTruthy();
    });

    test("it returns a false when the parent updates", () => {
      const id = "test";
      const parent = new DependencyClass(1, () => {});

      dependency.bookUpdate(id);
      dependency.setMount(true);
      dependency.setParents([parent]);
      expect(dependency.canUpdate(id)).toBeTruthy();

      parent.bookUpdate(id);
      parent.setMount(true);
      expect(dependency.canUpdate(id)).toBeFalsy();

      parent.setMount(false);
      expect(dependency.canUpdate(id)).toBeTruthy();
    });
  });

  describe("forceUpdate function", () => {
    it("Always execute the passed updateView function", () => {
      dependency.forceUpdate();
      expect(updateViewMock);
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
      dependency.setMount(true);
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

  describe("setMount function", () => {
    test("Chagne didMount value", () => {
      dependency.setMount(false);
      expect(dependency.didMount).toBeFalsy();

      dependency.setMount(true);
      expect(dependency.didMount).toBeTruthy();
    });
  });

  describe("setParents function", () => {
    test("Change parents value", () => {
      const updateValue: Dependency[] = [];

      dependency.setParents(updateValue);
      expect(dependency.parents).toEqual(updateValue);

      const updateValue2 = [dependency];

      dependency.setParents(updateValue2);
      expect(dependency.parents).toEqual(updateValue2);
    });
  });
});
