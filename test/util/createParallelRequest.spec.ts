import { createParallelRequest } from "@/util/createParallelRequest";
import { StoreClass } from "@/elements/store";
import { FlowClass } from "@/elements/flow";
import { Store } from "@/type";

describe("createParallelRequest", () => {
  const initState = { test: "" };

  type StateType = typeof initState;
  type Apis = { test: () => Promise<string> };

  const create = (payload: FlowClass<StateType, Apis>[]) => {
    return createParallelRequest(payload);
  };

  let apis: Apis;
  let apiMock: jest.Mock<Promise<string>, []>;
  let store: Store<StateType, Apis>;

  beforeEach(() => {
    apiMock = jest.fn(async () => "test");
    apis = { test: apiMock };
    store = new StoreClass({ apis, reducer: (s) => s, initState });
  });

  test("Return a request function for parallel", () => {
    const request = create([]);

    expect(request).toBeInstanceOf(Function);
  });

  test("The request function execute children flows' the start function", () => {
    const childFlow = new FlowClass(1, store, (flow) => flow.complete());
    const childFlow2 = new FlowClass(1, store, (flow) => flow.complete());
    const request = createParallelRequest([childFlow, childFlow2]);
    const parallelFlow = new FlowClass(2, store, request);
    const startMock = jest.fn();

    childFlow.start = startMock;
    childFlow2.start = startMock;

    request(parallelFlow);
    expect(startMock).toBeCalledTimes(2);
  });

  test("Execute complete function when all children flows complete", () => {
    const childComplete: Array<() => void> = [];
    const children = [1, 2].map((id) => {
      return new FlowClass(id, store, (flow) =>
        childComplete.push(flow.complete)
      );
    });
    const request = createParallelRequest(children);
    const parallelFlow = new FlowClass(2, store, request);
    const completeMock = jest.fn();

    parallelFlow.complete = completeMock;

    request(parallelFlow);
    childComplete.shift()?.(); // execute a complete of first flow
    expect(completeMock).not.toBeCalled();

    childComplete.shift()?.(); // execute a complete of second flow
    expect(completeMock).toBeCalledTimes(1);
  });

  test("Execute error function when children flows throw an error", () => {
    const children = [1, 2].map((id) => {
      return new FlowClass(id, store, (flow) => {
        if (id === 2) flow.error(new Error());
        else flow.complete();
      });
    });
    const request = createParallelRequest(children);
    const parallelFlow = new FlowClass(2, store, request);
    const errorMock = jest.fn();

    parallelFlow.error = errorMock;

    request(parallelFlow);
    expect(errorMock).toBeCalledTimes(1);
  });

  test("Execute cancel function when children flows cancel", () => {
    const children = [1, 2].map((id) => {
      return new FlowClass(id, store, (flow) => {
        if (id === 2) flow.cancel();
        else flow.complete();
      });
    });
    const request = createParallelRequest(children);
    const parallelFlow = new FlowClass(2, store, request);
    const cancelMock = jest.fn();

    parallelFlow.cancel = cancelMock;

    request(parallelFlow);
    expect(cancelMock).toBeCalledTimes(1);
  });
});
