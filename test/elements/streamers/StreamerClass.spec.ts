import { StoreClass } from "../../../src/elements/StoreClass";
import { StreamClass } from "../../../src/elements/StreamClass";
import { StreamerClass } from "../../../src/elements/streamers/StreamerClass";
import { Effect } from "../../../src/types";

describe("StreamerClass Tests", () => {
  const initState = 0;
  const initEffect: Effect = { type: "request", request: "test", payload: [] };
  let affectMock: jest.Mock<void, [Effect, Effect]>;
  let stream: StreamClass;
  let streamer: StreamerClass<any>;
  let store: StoreClass<typeof initState, any>;

  beforeEach(() => {
    affectMock = jest.fn();
    stream = new StreamClass(initEffect);
    stream["affect"] = affectMock;
    store = new StoreClass({ initState, reducer: (s) => s });
    streamer = new StreamerClass(stream, store);
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
    test("Execute the send function of stream", () => {
      const sendMock = jest.fn();

      stream.send = sendMock;
      const [state, isPending] = streamer.start();

      expect(streamer["status"]).toEqual("started");
      expect(sendMock).toBeCalled();
      expect(state).toEqual(initState);
      expect(isPending).toBeTruthy();
    });

    test("Receive notification of stream completion", () => {
      const compliteMock = jest.fn();

      streamer.addEventListener("finished", compliteMock);
      streamer.start();
      stream["complite"](initEffect);
      expect(compliteMock).toBeCalledTimes(1);

      streamer["status"] = "none";
      streamer.start();
      stream["complite"](initEffect);
      expect(compliteMock).toBeCalledTimes(2);
    });

    test("Execute the send function of stream only once", () => {
      const sendMock = jest.fn();

      stream.send = sendMock;
      streamer.start();
      expect(sendMock).toBeCalledTimes(1);

      streamer.start();
      expect(sendMock).toBeCalledTimes(1);
    });
  });

  describe("forceStart function", () => {
    test("Always execute the send function of stream whenever not in 'started' status", () => {
      const sendMock = jest.fn();
      stream.send = sendMock;

      streamer.forceStart();
      expect(sendMock).toBeCalledTimes(1);
      expect(sendMock).toHaveBeenLastCalledWith("request");

      streamer.cancel("Test");
      expect(sendMock).toBeCalledTimes(2);
      expect(sendMock).toHaveBeenLastCalledWith("cancel", "Test");

      streamer.forceStart();
      expect(sendMock).toBeCalledTimes(3);
      expect(sendMock).toHaveBeenLastCalledWith("request");
    });
  });

  describe("cancel function", () => {
    test("Pass a cancel payload to stream", () => {
      const cancelMock = jest.fn();

      stream.send = cancelMock;
      streamer["changeStatus"]("started");
      streamer.cancel("test");

      expect(cancelMock).toBeCalledWith("cancel", "test");
      expect(streamer["status"]).toEqual("cancel");
    });

    test("Can cancel only when 'started'", () => {
      const cancelMock = jest.fn();

      stream.send = cancelMock;
      streamer.cancel("test");

      expect(cancelMock).not.toBeCalled();
      expect(streamer["status"]).not.toEqual("cancel");
    });
  });

  describe("error function", () => {
    test("Pass as error object to stream", () => {
      const errorMock = jest.fn();
      const testError = new Error("Test");

      stream.send = errorMock;
      streamer["changeStatus"]("started");
      streamer.error(testError);

      expect(errorMock).toBeCalledWith("error", testError);
      expect(streamer["status"]).toEqual("error");
    });

    test("Can error only when 'started'", () => {
      const testError = new Error("Test");
      const errorMock = jest.fn();

      stream.send = errorMock;
      streamer.error(testError);

      expect(errorMock).not.toBeCalled();
      expect(streamer["status"]).not.toEqual("error");
    });
  });

  describe("finish function", () => {
    test("Can finish the streamer", () => {
      const listenerMock: jest.Mock = jest.fn();

      streamer.addEventListener("finished", listenerMock);
      streamer.start();
      streamer.finish();

      expect(listenerMock).toBeCalled();
      expect(streamer["status"]).toEqual("finished");
    });

    test("Can finish only when 'started'", () => {
      const doneMock = jest.fn();

      stream.send = doneMock;
      streamer.finish();

      expect(doneMock).not.toBeCalled();
      expect(streamer["status"]).not.toEqual("finished");
    });
  });
});
