import { DependencyClass } from "../../src/elements/DependencyClass";
import { createAffecters } from "../../src/utils/createAffecters";
import { StreamerManagerClass } from "../../src/managers/StreamerManagerClass";
import { Dependency, Affecters } from "../../src/types";
import { StoreClass } from "../../src/elements/StoreClass";

describe("DependencyClass Tests", () => {
  let dependency: DependencyClass;
  let updateViewMock: jest.Mock;
  let store: StoreClass<any, any>;
  let streamerMg: StreamerManagerClass<any>;
  let affecters: Affecters;

  beforeEach(() => {
    updateViewMock = jest.fn();
    dependency = new DependencyClass(0, updateViewMock);
    store = new StoreClass({ initState: 0, reducer: (s) => s });
    affecters = createAffecters(store);
    streamerMg = new StreamerManagerClass(store, affecters);
  });

  test("Execute updateView when added streamer is finished", () => {
    const streamer = streamerMg.createStreamer("test", []);

    dependency.setMount(true);
    dependency.addStreamer(streamer);
    streamer.start((s) => s);
    streamer.finish();

    expect(updateViewMock).toBeCalled();
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

  describe("addStreamer function", () => {
    test("Add passed streamer to streamerList property", () => {
      expect(dependency["streamerList"].size).toEqual(0);

      const streamer = streamerMg.createStreamer("test", []);

      dependency.addStreamer(streamer);

      expect(dependency["streamerList"].size).toEqual(1);
    });

    test("Do not add passed streamer when it has already been added", () => {
      const streamer = streamerMg.createStreamer("test", []);

      dependency.addStreamer(streamer);
      dependency.addStreamer(streamer);

      expect(dependency["streamerList"].size).toEqual(1);
    });

    test("Execute addEventListener of passed streamer", () => {
      const streamer = streamerMg.createStreamer("test", []);
      const addEventListener = jest.fn();

      streamer["addEventListener"] = addEventListener;
      dependency.addStreamer(streamer);

      expect(addEventListener).toBeCalledWith("finished", expect.any(Function));
      expect(addEventListener).toBeCalledWith("started", expect.any(Function));
    });
  });

  describe("deleteStreamer function", () => {
    test("Delete passed streamer from streamerList property", () => {
      const streamer = streamerMg.createStreamer("test", []);
      const otherStreamer = streamerMg.createStreamer("test2", []);

      dependency.addStreamer(streamer);
      dependency.addStreamer(otherStreamer);
      expect(dependency["streamerList"].size).toEqual(2);

      dependency.deleteStreamer(streamer.id);
      expect(dependency["streamerList"].size).toEqual(1);

      dependency.deleteStreamer(otherStreamer.id);
      expect(dependency["streamerList"].size).toEqual(0);
    });

    test("Execute removeListener", () => {
      const removeListenerMock = jest.fn();
      const streamer = streamerMg.createStreamer("test", []);
      streamer["addEventListener"] = jest.fn(() => removeListenerMock);

      dependency.addStreamer(streamer);
      expect(dependency["streamerList"].size).toEqual(1);

      dependency.deleteStreamer(streamer.id);
      expect(removeListenerMock).toBeCalled();
    });
  });

  describe("canUpdate function", () => {
    test("Return true when it has a passed streamer", () => {
      const streamer = streamerMg.createStreamer("test", []);

      dependency.addStreamer(streamer);

      expect(dependency.canUpdate(streamer)).toBeTruthy();
    });

    test("Return false when parent dependency is updated or it has not a passed streamer", () => {
      const parentDep = new DependencyClass(0, () => {});
      const streamer = streamerMg.createStreamer("test", []);

      expect(dependency.canUpdate(streamer)).toBeFalsy();

      parentDep.addStreamer(streamer);
      dependency.setParents([parentDep]);

      expect(dependency.canUpdate(streamer)).toBeFalsy();
    });
  });

  describe("popUpdate function", () => {
    test("Execute updateView function", () => {
      const streamer = streamerMg.createStreamer("test", []);

      dependency.setMount(false);
      dependency.addStreamer(streamer);
      streamer.start((s) => s);
      streamer.finish();
      expect(updateViewMock).not.toBeCalled();

      dependency.setMount(true);
      dependency.popUpdate();
      expect(updateViewMock).toBeCalled();
    });
  });
});
