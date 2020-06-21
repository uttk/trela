import { StreamerBaseClass } from "../../../src/elements/streamers/StreamerBaseClass";
import { StoreClass } from "../../../src/elements/StoreClass";
import { StreamerStatus } from "../../../src/types";

describe("StreamerBaseClass Tests", () => {
  const initState = 0;
  let streamer: StreamerBaseClass<any>;
  let store: StoreClass<any, any>;

  beforeEach(() => {
    store = new StoreClass({ initState, reducer: (s) => s });
    streamer = new StreamerBaseClass("test", store);
  });

  describe("addEventListener function", () => {
    test("Can be notified of events", () => {
      const eventMock = jest.fn();

      streamer.addEventListener("error", eventMock);
      streamer.addEventListener("cancel", eventMock);
      streamer.addEventListener("started", eventMock);
      streamer.addEventListener("finished", eventMock);

      streamer["changeStatus"]("error");
      expect(eventMock).toBeCalledTimes(1);

      streamer["changeStatus"]("cancel");
      expect(eventMock).toBeCalledTimes(2);

      streamer["changeStatus"]("started");
      expect(eventMock).toBeCalledTimes(3);

      streamer["changeStatus"]("finished");
      expect(eventMock).toBeCalledTimes(4);
    });

    test("Can stop event listening", () => {
      const eventMock = jest.fn();

      streamer.addEventListener("error", eventMock)();
      streamer["changeStatus"]("error");
      expect(eventMock).not.toBeCalled();

      streamer.addEventListener("cancel", eventMock)();
      streamer["changeStatus"]("cancel");
      expect(eventMock).not.toBeCalled();

      streamer.addEventListener("started", eventMock)();
      streamer["changeStatus"]("started");
      expect(eventMock).not.toBeCalled();

      streamer.addEventListener("finished", eventMock)();
      streamer["changeStatus"]("finished");
      expect(eventMock).not.toBeCalled();
    });
  });

  describe("start function", () => {
    test("Execute the backStart function when the streamer status other than 'started'", () => {
      const backStartMock = jest.fn();
      const status: StreamerStatus[] = [
        "none",
        "error",
        "cancel",
        "started",
        "finished",
      ];

      streamer["backStart"] = backStartMock;

      status.forEach((kind) => {
        streamer["status"] = kind;
        streamer.start();

        if (kind !== "started") {
          expect(backStartMock).toBeCalledTimes(1);
          backStartMock.mockReset();
        } else {
          expect(backStartMock).not.toBeCalled();
        }
      });
    });
  });

  describe("once function", () => {
    test("Execute the backStart function only once", () => {
      const backStartMock = jest.fn();

      streamer["backStart"] = backStartMock;
      const [state, isLoading] = streamer.once();

      expect(state).toEqual(initState);
      expect(isLoading).toBeTruthy();
      expect(backStartMock).toBeCalled();

      streamer.once();
      expect(backStartMock).toBeCalledTimes(1);

      streamer.finish();
      streamer.once();
      expect(backStartMock).toBeCalledTimes(1);
    });

    test("Reflects the status", () => {
      const latestState = "latest value";
      let [state, isPending] = streamer.once();

      expect(state).toEqual(initState);
      expect(isPending).toBeTruthy();

      store["state"] = latestState;
      streamer.finish();
      [state, isPending] = streamer.once();
      expect(isPending).toBeFalsy();
      expect(state).toBe(latestState);
    });
  });

  describe("forceStart function", () => {
    test("Always execute backStart whenever not in 'started' status", () => {
      const backStartMock = jest.fn();
      streamer["backStart"] = backStartMock;

      streamer.forceStart();
      expect(backStartMock).toBeCalledTimes(1);

      streamer.cancel();
      streamer.forceStart();
      expect(backStartMock).toBeCalledTimes(2);

      streamer.error(new Error(""));
      streamer.forceStart();
      expect(backStartMock).toBeCalledTimes(3);

      streamer.finish();
      streamer.forceStart();
      expect(backStartMock).toBeCalledTimes(4);
    });
  });

  describe("cancel function", () => {
    test("Can cancel the streamer", () => {
      const eventMock = jest.fn();

      streamer.addEventListener("cancel", eventMock);
      streamer["changeStatus"]("started");
      streamer.cancel();

      expect(streamer["status"]).toEqual("cancel");
      expect(eventMock).toBeCalled;
    });

    test("Can cancel only when 'started'", () => {
      const eventMock = jest.fn();

      streamer.addEventListener("cancel", eventMock);
      streamer["changeStatus"]("finished");
      streamer.cancel();

      expect(eventMock).not.toBeCalled();
    });
  });

  describe("error function", () => {
    test("Can pass the error object to affecter", () => {
      const eventMock = jest.fn();
      const testError = new Error("Test");

      streamer.addEventListener("error", eventMock);
      streamer["changeStatus"]("started");
      streamer.error(testError);

      expect(streamer["status"]).toEqual("error");
      expect(eventMock.mock.calls[0][0]).toBe(testError);
    });

    test("Can error only when 'started'", () => {
      const eventMock = jest.fn();

      streamer.addEventListener("error", eventMock);
      streamer.error(new Error("Test"));

      expect(eventMock).not.toBeCalled();
    });
  });

  describe("finish function", () => {
    test("Can finish the streamer", () => {
      const eventMock = jest.fn();

      streamer.addEventListener("finished", eventMock);
      streamer["changeStatus"]("started");
      streamer.finish();

      expect(streamer["status"]).toEqual("finished");
      expect(eventMock).toBeCalled();
    });

    test("Can finish only when 'started'", () => {
      const eventMock = jest.fn();

      streamer.addEventListener("finished", eventMock);
      streamer.finish();

      expect(eventMock).not.toBeCalled();
    });
  });
});
