import { StoreClass } from "../../src/elements/StoreClass";
import { createAffecters } from "../../src/utils/createAffecters";
import { Affecters, ApisBase, TrelaReducer, Effect } from "../../src/types";

describe("createAffecters function Tests", () => {
  let initState: any;
  let apis: ApisBase;
  let reducer: jest.Mock<TrelaReducer<any, any>>;
  let store: StoreClass<any, any>;
  let affecters: Affecters;

  beforeEach(() => {
    initState = 0;
    apis = {
      test: jest.fn(async () => "test message"),
      errorTest: jest.fn(async () => {
        throw new Error("Test Error");
      }),
    };
    reducer = jest.fn((state) => state);
    store = new StoreClass({ apis, reducer, initState });
    affecters = createAffecters(store);
  });

  test("Return Affecters value", () => {
    expect(Object.keys(affecters).sort()).toEqual(
      ["request", "resolve", "done", "cancel", "error"].sort()
    );
  });

  describe("Request Affecter", () => {
    test("Pass the resolve effect to next function", () => {
      const effect: Effect = { type: "request", request: "", payload: "test" };
      const nextMock = jest.fn();

      affecters.request(effect, nextMock, () => {});

      expect(nextMock).toBeCalled();
      expect(nextMock.mock.calls[0][0]).toStrictEqual({
        ...effect,
        type: "resolve",
      });
    });
  });

  describe("Resolve Affecter", () => {
    test("Pass the done effect to the next function when the API function is resolved", (done) => {
      const effect: Effect = { type: "resolve", request: "test", payload: [] };
      const nextMock = jest.fn();

      affecters.resolve(effect, nextMock, () => {});

      setTimeout(() => {
        expect(apis.test).toBeCalled();
        expect(nextMock).toBeCalled();
        expect(nextMock.mock.calls[0][0]).toStrictEqual({
          ...effect,
          type: "done",
          payload: "test message",
        });

        done();
      });
    });

    test("Pass the error effect to the next function when the API function throw an error", (done) => {
      const effect: Effect = {
        type: "resolve",
        request: "errorTest",
        payload: [],
      };
      const nextMock = jest.fn();

      affecters.resolve(effect, nextMock, () => {});

      setTimeout(() => {
        expect(apis.errorTest).toBeCalled();
        expect(nextMock).toBeCalled();
        expect(nextMock.mock.calls[0][0]).toStrictEqual({
          ...effect,
          type: "error",
          payload: expect.any(Error),
        });

        done();
      });
    });
  });

  describe("Done Affecter", () => {
    test("Pass the done effect to the done callback", () => {
      const effect: Effect = {
        type: "done",
        request: "test",
        payload: "test message",
      };
      const doneMock = jest.fn();
      const dispatchMock = jest.fn();
      store["dispatch"] = dispatchMock;

      affecters.done(effect, () => {}, doneMock);

      expect(doneMock).toBeCalled();
      expect(doneMock.mock.calls[0][0]).toStrictEqual({ ...effect });
    });

    test("Execute the reducer and updateState of Store", () => {
      const f = () => {};
      const effect: Effect = {
        type: "done",
        request: "_test_",
        payload: "payload",
      };
      const dispatchMock = jest.fn(store.dispatch);

      store["dispatch"] = dispatchMock;
      affecters.done(effect, f, f);

      expect(reducer).toBeCalledWith(initState, {
        type: effect.request,
        payload: effect.payload,
      });
      expect(dispatchMock).toBeCalled();
      expect(dispatchMock).toBeCalledWith({
        type: effect.request,
        payload: effect.payload,
      });
    });
  });

  describe("Cancel Affecter", () => {
    test("do nothing", () => {
      const effect: Effect = { type: "cancel", request: "", payload: 0 };
      const doneMock = jest.fn();
      const nextMock = jest.fn();

      affecters.cancel(effect, nextMock, doneMock);

      expect(doneMock).not.toBeCalled();
      expect(nextMock).not.toBeCalled();
    });
  });

  describe("Error Affecter", () => {
    test("Throw an Error", () => {
      const payload = new Error("test error");
      const effect: Effect = { type: "error", request: "", payload };

      expect(() => {
        affecters.error(
          effect,
          () => {},
          () => {}
        );
      }).toThrow(payload);
    });
  });
});
