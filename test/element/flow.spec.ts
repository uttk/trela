import { FlowClass } from "@/elements/flow";
import { StoreClass } from "@/elements/store";
import { FlowStatus } from "@/type";

describe("DependencyClass Tests", () => {
  const initState = { key: "value" };
  let flow: FlowClass<typeof initState, {}>;
  let store: StoreClass<typeof initState, {}>;
  let requestMock: jest.Mock;

  beforeEach(() => {
    requestMock = jest.fn();
    store = new StoreClass({ initState, apis: {}, reducer: (s) => s });
    flow = new FlowClass(11, store, requestMock);
  });

  describe("changeStatus", () => {
    const keys = ["cancel", "error", "finished", "none", "started"];

    test("Can change flow.status value", () => {
      keys.forEach((key) => {
        flow["changeStatus"](key as FlowStatus);
        expect(flow.status).toEqual(key);
      });
    });

    test("Execute passed callbacks", () => {
      const eventCallbackMock = jest.fn();

      keys.forEach((v) => {
        const key = v as FlowStatus;

        flow.addEventCallback(key, eventCallbackMock);
        flow["changeStatus"](key);

        expect(eventCallbackMock).toBeCalledTimes(1);

        eventCallbackMock.mockClear();
      });
    });

    test("Does not execute passed callbacks when the same flow status", () => {
      const eventCallbackMock = jest.fn();

      expect(flow.status).toEqual("none");
      flow.addEventCallback("none", eventCallbackMock);

      flow["changeStatus"]("none");
      expect(eventCallbackMock).not.toBeCalled();
    });
  });

  describe("getStore", () => {
    test("Return the store instance", () => {
      expect(flow.getStore()).toBe(store);
    });
  });

  describe("addEventCallback", () => {
    const keys = ["cancel", "error", "finished", "none", "started"];

    test("Can add a passed callback", () => {
      const callback = () => void 0;

      keys.forEach((v) => {
        const key = v as FlowStatus;

        flow.addEventCallback(key, callback);
        expect(flow["callbacks"].get(key)?.size).toBe(1);

        flow.addEventCallback(key, callback);
        expect(flow["callbacks"].get(key)?.size).toBe(1);

        flow.addEventCallback(key, () => void 0);
        expect(flow["callbacks"].get(key)?.size).toBe(2);
      });
    });

    test("Return a removeCallback function", () => {
      keys.forEach((v) => {
        const key = v as FlowStatus;
        const removeCallback = flow.addEventCallback(key, () => void 0);

        expect(flow["callbacks"].get(key)?.size).toBe(1);

        removeCallback();
        expect(flow["callbacks"].get(key)?.size).toBe(0);
      });
    });
  });

  describe("start", () => {
    test("Execute the passed request function when flow.status is not 'started'", () => {
      flow.start();
      expect(requestMock).toBeCalledTimes(1);

      flow.start();
      expect(requestMock).toBeCalledTimes(1);
    });

    test("Change flow.status to 'started'", () => {
      flow.start();
      expect(flow.status).toEqual("started");
    });
  });

  describe("cancel", () => {
    test("Change flow.status to 'cancel'", () => {
      expect(flow.status).not.toEqual("cancel");

      flow.cancel();
      expect(flow.status).toEqual("cancel");
    });

    test("Does not execute the passed request function", () => {
      flow.cancel();
      expect(requestMock).not.toBeCalled();
    });
  });

  describe("error", () => {
    test("Change flow.status to 'error'", () => {
      expect(flow.status).not.toEqual("error");

      flow.error(new Error());
      expect(flow.status).toEqual("error");
    });

    test("Holds the passed Error", () => {
      const error = new Error();

      expect(flow.currentError).not.toEqual(error);

      flow.error(error);
      expect(flow.currentError).toEqual(error);
    });
  });

  describe("complete", () => {
    test("Change flow.status to 'finished' when it is 'started'", () => {
      expect(flow.status).not.toEqual("started");

      flow.complete();
      expect(flow.status).not.toEqual("finished");

      flow.status = "started";
      expect(flow.status).toEqual("started");

      flow.complete();
      expect(flow.status).toEqual("finished");
    });
  });
});
