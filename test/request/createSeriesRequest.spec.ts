import { FlowClass } from "@/elements/flow";
import { StoreClass } from "@/elements/store";
import { createSeriesRequest } from "@/request/createSeriesRequest";
import { Store } from "@/type";

describe("createSeriesRequest", () => {
  const initState = { test: "" };

  type StateType = typeof initState;
  type Apis = { test: () => Promise<string> };

  const createRequest = (payload: FlowClass<StateType, Apis>[]) => {
    return createSeriesRequest(payload);
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
    const request = createRequest([]);

    expect(request).toBeInstanceOf(Function);
  });

  test("Can execute children flows' the start function in sequence", () => {
    const children = [1, 2, 3].map((id) => {
      const flow = new FlowClass(id, store, (flow) => flow.complete());

      flow.start = jest.fn(flow.start);

      return flow;
    });
    const seriesFlow = new FlowClass(1111, store, createRequest(children));

    seriesFlow.start();
    expect(seriesFlow.status).toEqual("finished");

    children.forEach((flow) => {
      expect(flow.start).toBeCalledTimes(1);
    });
  });

  test("Can execute complete function when all children flows complete", () => {
    const childComplete: Array<() => void> = [];
    const children = [1, 2, 3].map((id) => {
      return new FlowClass(id, store, (flow) =>
        childComplete.push(flow.complete)
      );
    });
    const seriesFlow = new FlowClass(1111, store, createRequest(children));
    const completeMock = jest.fn();

    seriesFlow.complete = completeMock;

    seriesFlow.start();
    childComplete.shift()?.(); // execute a complete of first flow
    expect(completeMock).not.toBeCalled();

    childComplete.shift()?.(); // execute a complete of second flow
    expect(completeMock).not.toBeCalled();

    childComplete.shift()?.(); // execute a complete of third flow
    expect(completeMock).toBeCalledTimes(1);
  });

  test("Can execute error function when children flows throw an error", () => {
    const children = [1, 2, 3].map((id) => {
      return new FlowClass(id, store, (flow) => {
        if (id === 2) flow.error(new Error());
        else flow.complete();
      });
    });
    const seriesFlow = new FlowClass(2, store, createRequest(children));
    const errorMock = jest.fn();

    seriesFlow.error = errorMock;

    seriesFlow.start();
    expect(errorMock).toBeCalledTimes(1);
  });

  test("Can execute cancel function when children flows cancel", () => {
    const children = [1, 2, 3].map((id) => {
      return new FlowClass(id, store, (flow) => {
        if (id === 2) flow.cancel();
        else flow.complete();
      });
    });
    const seriesFlow = new FlowClass(2, store, createRequest(children));
    const cancelMock = jest.fn();

    seriesFlow.cancel = cancelMock;

    seriesFlow.start();
    expect(cancelMock).toBeCalledTimes(1);
  });
});
