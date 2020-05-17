import { StoreClass } from "../../src/elements/StoreClass";
import { TrelaReducer } from "../../src/types";

describe("StoreClass Tests", () => {
  const initState = {
    name: "John",
    age: 0,
  };
  let reducer: TrelaReducer<typeof initState, any>;
  let store: StoreClass<typeof initState, any>;

  beforeEach(() => {
    reducer = jest.fn((_, a) => a.payload as typeof initState);
    store = new StoreClass({ initState, reducer });
  });

  describe("getState function", () => {
    test("Return state value", () => {
      expect(store.getState()).toStrictEqual(initState);
    });
  });

  describe("dispatch function", () => {
    test("Update state value", () => {
      const payload = { name: "Mike", age: 30 };
      const action = { type: "test", payload };

      store.dispatch(action);

      expect(store.getState()).toStrictEqual(payload);
      expect(reducer).toBeCalledWith(initState, action);
    });
  });

  describe("init function", () => {
    test("Initialize state value", () => {
      const payload = { name: "Mike", age: 30 };
      const action = { type: "test", payload };

      store.dispatch(action);

      expect(store.getState()).toStrictEqual(payload);

      store.init();

      expect(store.getState()).toStrictEqual(initState);
    });
  });
});
