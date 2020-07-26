import { StoreClass } from "@/elements/store";
import { Reducer, CreateActionsType } from "@/type";

describe("Store Class", () => {
  const initState = { test: "test" };
  const apis = { test: async () => "test" };

  type StateType = typeof initState;
  type Apis = typeof apis;

  let reducerMock: Reducer<StateType, Apis>;
  let store: StoreClass<StateType, Apis>;

  beforeEach(() => {
    reducerMock = jest.fn((s) => s);

    store = new StoreClass({
      apis,
      initState,
      reducer: reducerMock,
    });
  });

  describe("getApiKeys", () => {
    test("Return api keys", () => {
      const keys = Object.keys(apis).sort();

      expect(store.getApiKeys().sort()).toStrictEqual(keys);
    });
  });

  describe("getState", () => {
    test("Return the latest state value", () => {
      expect(store.getState()).toEqual(initState);

      const updateValue = { test: "text" };
      store["state"] = updateValue;

      expect(store.getState()).not.toEqual(initState);
      expect(store.getState()).toStrictEqual(updateValue);
    });
  });

  describe("getApi", () => {
    test("Return the passed api value", () => {
      const keys: Array<keyof Apis> = ["test"];

      keys.forEach((key) => {
        expect(store.getApi(key)).toEqual(apis[key]);
      });
    });
  });

  describe("updateState", () => {
    test("Update state value", () => {
      expect(store["state"]).toEqual(initState);

      const updateValue = { test: "text" };

      store.updateState(updateValue);
      expect(store["state"]).toStrictEqual(updateValue);
    });

    test("Execute registered callbacks and callback receives the latest state", () => {
      const mock = jest.fn();
      const updateValue = { test: "latest text" };

      store.subscribe(mock);
      store.updateState(updateValue);
      expect(mock).toBeCalledWith(updateValue);
    });

    test("Do not update if the values to be updated are the same", () => {
      expect(store["state"]).toEqual(initState);

      const mock = jest.fn();

      store.subscribe(mock);
      store.updateState(initState);
      expect(mock).not.toBeCalled();
      expect(store["state"]).toEqual(initState);
    });
  });

  describe("subscribe", () => {
    test("Add the passed callback", () => {
      store.subscribe(() => void 0);
      expect(store["listeners"].size).toBe(1);

      store.subscribe(() => void 0);
      expect(store["listeners"].size).toBe(2);
    });

    test("Do not add the same callback", () => {
      const callback = () => void 0;

      store.subscribe(callback);
      expect(store["listeners"].size).toBe(1);

      store.subscribe(callback);
      expect(store["listeners"].size).toBe(1);
    });

    test("Return a removeCallback", () => {
      const removeCalblack = store.subscribe(() => void 0);
      const removeCalblack2 = store.subscribe(() => void 0);

      expect(store["listeners"].size).toBe(2);

      removeCalblack();
      expect(store["listeners"].size).toBe(1);

      removeCalblack2();
      expect(store["listeners"].size).toBe(0);
    });
  });

  describe("dispatch", () => {
    test("Execute the passed reducer function", () => {
      const action: CreateActionsType<Apis> = { type: "test", payload: "text" };

      store.dispatch(action);
      expect(reducerMock).toBeCalledTimes(1);
      expect(reducerMock).toBeCalledWith(store["state"], action);
    });
  });
});
