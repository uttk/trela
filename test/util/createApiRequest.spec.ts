import { createApiRequest } from "@/util/createApiRequest";
import { StoreClass } from "@/elements/store";
import { FlowClass } from "@/elements/flow";
import { waitFor } from "@testing-library/react";

describe("createApiRequest", () => {
  const initState = { test: "" };

  type StateType = typeof initState;
  type Apis = { test: () => Promise<string> };

  const create = <AK extends keyof Apis>(
    req: AK,
    payload: Parameters<Apis[AK]>
  ) => {
    return createApiRequest(req, payload);
  };

  let apis: Apis;
  let apiMock: jest.Mock<Promise<string>, []>;
  let store: StoreClass<StateType, Apis>;

  beforeEach(() => {
    apiMock = jest.fn(async () => "test");
    apis = { test: apiMock };
    store = new StoreClass({ apis, reducer: (s) => s, initState });
  });

  test("Return a request function", () => {
    const request = create("test", []);

    expect(request).toBeInstanceOf(Function);
  });

  test("The request function execute a api function", () => {
    const request = create("test", []);
    const flow = new FlowClass(1, store, request);

    request(flow);
    expect(apiMock).toBeCalled();
  });

  test("The request function execute flow.complete function", async () => {
    const request = create("test", []);
    const flow = new FlowClass(1, store, request);
    const eventMock = jest.fn();

    flow.complete = eventMock;
    flow.error = eventMock;

    request(flow);
    expect(apiMock).toBeCalled();
    await waitFor(() => expect(eventMock).toBeCalled());
    expect(eventMock).toBeCalledTimes(1);
  });

  test("The request function execute a dispatch function of the passed store", async () => {
    const request = create("test", []);
    const flow = new FlowClass(1, store, request);
    const dispatchMock = jest.fn();

    store.dispatch = dispatchMock;

    request(flow);
    await waitFor(() => expect(dispatchMock).toBeCalled());
    expect(dispatchMock).toBeCalledWith({ type: "test", payload: "test" });
  });

  test("The request function execute flow.error function when throw an Error", async () => {
    const request = create("test", []);
    const flow = new FlowClass(1, store, request);
    const errorMock = jest.fn();
    flow.error = errorMock;

    // Overwrite to throw an error
    apis.test = jest.fn(async () => {
      throw new Error();
    });

    request(flow);
    await waitFor(() => expect(errorMock).toBeCalled());
  });
});
