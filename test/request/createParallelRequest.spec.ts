import { FlowClass } from "@/elements/flow";
import { StoreClass } from "@/elements/store";
import { createParallelRequest } from "@/request/createParallelRequest";
import { Store, FlowApi } from "@/type";
import { createFlowApi } from "@/util/createFlowApi";

describe("createParallelRequest", () => {
  const initState = { test: "" };

  type S = typeof initState;
  type A = { test: () => Promise<string> };

  const createRequest = (payload: FlowApi<S>[]) => {
    return createParallelRequest<S, A>(payload);
  };

  let apis: A;
  let apiMock: jest.Mock<Promise<string>, []>;
  let store: Store<S, A>;

  beforeEach(() => {
    apiMock = jest.fn(async () => "test");
    apis = { test: apiMock };
    store = new StoreClass({ apis, reducer: (s) => s, initState });
  });

  test("Return a request function for parallel", () => {
    const request = createRequest([]);

    expect(request).toBeInstanceOf(Function);
  });

  test("Can execute children flows' the start function", () => {
    const startMock = jest.fn();
    const children = [1, 2].map((id) => {
      const flow = new FlowClass(id, store, (flow) => flow.complete());

      flow.start = startMock;

      return createFlowApi(flow, () => void 0);
    });
    const parallelFlow = new FlowClass(2, store, createRequest(children));

    parallelFlow.start();
    expect(startMock).toBeCalledTimes(2);
  });

  test("Can execute complete function when all children flows complete", () => {
    const childComplete: Array<() => void> = [];
    const children = [1, 2].map((id) => {
      return createFlowApi(
        new FlowClass(id, store, (flow) => childComplete.push(flow.complete)),
        () => void 0
      );
    });
    const parallelFlow = new FlowClass(2, store, createRequest(children));
    const completeMock = jest.fn();

    parallelFlow.complete = completeMock;

    parallelFlow.start();
    childComplete.shift()?.(); // execute a complete of first flow
    expect(completeMock).not.toBeCalled();

    childComplete.shift()?.(); // execute a complete of second flow
    expect(completeMock).toBeCalledTimes(1);
  });

  test("Execute error function when children flows throw an error", () => {
    const children = [1, 2].map((id) => {
      return createFlowApi(
        new FlowClass(id, store, (flow) => {
          if (id === 2) flow.error();
          else flow.complete();
        }),
        () => void 0
      );
    });
    const parallelFlow = new FlowClass(2, store, createRequest(children));
    const errorMock = jest.fn();

    parallelFlow.error = errorMock;

    parallelFlow.start();
    expect(errorMock).toBeCalledTimes(1);
  });

  test("Execute cancel function when children flows cancel", () => {
    const children = [1, 2].map((id) => {
      return createFlowApi(
        new FlowClass(id, store, (flow) => {
          if (id === 2) flow.cancel();
          else flow.complete();
        }),
        () => void 0
      );
    });
    const parallelFlow = new FlowClass(2, store, createRequest(children));
    const cancelMock = jest.fn();

    parallelFlow.cancel = cancelMock;

    parallelFlow.start();
    expect(cancelMock).toBeCalledTimes(1);
  });
});
