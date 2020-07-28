import { FlowClass } from "@/elements/flow";
import { StoreClass } from "@/elements/store";
import { FlowApi } from "@/index";
import { createFlowApi } from "@/util/createFlowApi";

describe("createFlowApi", () => {
  const initState = { test: "" };
  const apis = { test: async () => "test" };

  type S = typeof initState;
  type A = typeof apis;

  let setupMock: () => void;
  let store: StoreClass<S, A>;
  let flow: FlowClass<S, A>;
  let flowApi: FlowApi<S>;

  beforeEach(() => {
    setupMock = jest.fn();
    store = new StoreClass({ apis, initState, reducer: (s) => s });
    flow = new FlowClass(1, store, () => void 0);
    flowApi = createFlowApi(flow, setupMock);
  });

  test("Return a flow api object", () => {
    const keys = Object.keys(flowApi);
    const expectKeys: Array<keyof FlowApi<any>> = [
      "cancel",
      "error",
      "forceStart",
      "id",
      "once",
      "start",
    ];

    expect(keys.sort()).toStrictEqual(expectKeys.sort());
  });

  test("The returned object has the Flow Id passed", () => {
    expect(flowApi.id).toBe(flow.id);

    const otherFlow = new FlowClass<S, A>(1000, store, () => void 0);
    const flowApi2 = createFlowApi(otherFlow, () => void 0);
    expect(flowApi2.id).toBe(otherFlow.id);
  });

  describe("Apis", () => {
    let startMock: () => void;
    let cancelMock: () => void;
    let errorMock: (error: Error) => void;

    beforeEach(() => {
      startMock = jest.fn(flow.start);
      cancelMock = jest.fn(flow.cancel);
      errorMock = jest.fn(flow.error);
      flow.start = startMock;
      flow.cancel = cancelMock;
      flow.error = errorMock;
    });

    describe("once", () => {
      test("Execute flow.start only when flow.status is 'none'", () => {
        expect(flow.status).toEqual("none");

        flowApi.once();
        expect(startMock).toBeCalledTimes(1);

        flowApi.once();
        expect(startMock).toBeCalledTimes(1);
        expect(flow.status).not.toEqual("none");

        flow.status = "none";
        flowApi.once();
        expect(startMock).toBeCalledTimes(2);
      });

      test("Always execute the passed setup function in once function", () => {
        flowApi.once();
        expect(setupMock).toBeCalledTimes(1);

        flowApi.once();
        expect(setupMock).toBeCalledTimes(2);
      });
    });

    describe("start", () => {
      test("Execute flow.start when flow.status is not 'started'", () => {
        expect(flow.status).not.toEqual("started");

        flowApi.start();
        expect(startMock).toBeCalledTimes(1);

        flowApi.start();
        expect(startMock).toBeCalledTimes(1);
        expect(flow.status).toEqual("started");

        flow.status = "none";
        flowApi.start();
        expect(startMock).toBeCalledTimes(2);
      });

      test("Always execute the passed setup function in start function", () => {
        flowApi.start();
        expect(setupMock).toBeCalledTimes(1);

        flowApi.start();
        expect(setupMock).toBeCalledTimes(2);
      });
    });

    describe("forceStart", () => {
      test("Always execute flow.start and cancel", () => {
        flowApi.forceStart();
        expect(startMock).toBeCalledTimes(1);
        expect(cancelMock).toBeCalledTimes(1);

        flowApi.forceStart();
        expect(startMock).toBeCalledTimes(2);
        expect(cancelMock).toBeCalledTimes(2);
      });

      test("Always execute the passed setup function in forceStart function", () => {
        flowApi.forceStart();
        expect(setupMock).toBeCalledTimes(1);

        flowApi.forceStart();
        expect(setupMock).toBeCalledTimes(2);
      });
    });

    describe("cancel", () => {
      test("Execute flow.cancel only when flow.status is 'started'", () => {
        expect(flow.status).not.toEqual("started");

        flowApi.cancel();
        expect(cancelMock).not.toBeCalled();

        flow.status = "started";
        flowApi.cancel();
        expect(cancelMock).toBeCalledTimes(1);
      });

      test("Always execute the passed setup function in cancel function", () => {
        flowApi.cancel();
        expect(setupMock).toBeCalledTimes(1);

        flowApi.cancel();
        expect(setupMock).toBeCalledTimes(2);
      });
    });

    describe("error", () => {
      test("Execute flow.error only when flow.status is 'started'", () => {
        expect(flow.status).not.toEqual("started");

        flowApi.error(new Error("Empty Error"));
        expect(errorMock).not.toBeCalled();

        flow.status = "started";
        flowApi.error(new Error("Empty Error"));
        expect(errorMock).toBeCalledTimes(1);
      });

      test("Always execute the passed setup function in error function", () => {
        flowApi.error(new Error("Empty Error"));
        expect(setupMock).toBeCalledTimes(1);

        flowApi.error(new Error("Empty Error"));
        expect(setupMock).toBeCalledTimes(2);
      });
    });
  });
});
