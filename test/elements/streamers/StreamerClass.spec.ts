import { StoreClass } from "../../../src/elements/StoreClass";
import { StreamClass } from "../../../src/elements/StreamClass";
import { StreamerClass } from "../../../src/elements/streamers/StreamerClass";
import { Effect, StreamerStatus } from "../../../src/types";

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

  describe("backStart function", () => {
    test("Execute the stream's send function", () => {
      const sendMock = jest.fn(stream.send.bind(stream));

      stream.send = sendMock;
      streamer["status"] = "started";
      streamer["backStart"]();

      expect(streamer["status"]).toEqual("started");
      expect(sendMock).toBeCalled();
    });

    test("Receive notification of the stream completion", () => {
      const compliteMock = jest.fn();
      const exec = () => {
        streamer["status"] = "started";
        streamer["backStart"]();
        stream["complite"](initEffect);
      };

      streamer.addEventListener("finished", compliteMock);

      exec();
      expect(compliteMock).toBeCalledTimes(1);
      expect(streamer["status"]).toBe("finished");

      exec();
      expect(compliteMock).toBeCalledTimes(2);
      expect(streamer["status"]).toBe("finished");
    });

    test("Execute the stream's send function when the streamer status is 'started'", () => {
      const sendMock = jest.fn(stream.send.bind(stream));
      const status: StreamerStatus[] = [
        "none",
        "error",
        "cancel",
        "started",
        "finished",
      ];

      stream.send = sendMock;

      status.forEach((kind) => {
        streamer["status"] = kind;
        streamer["backStart"]();

        if (kind === "started") {
          expect(sendMock).toBeCalledTimes(1);
          sendMock.mockReset();
        } else {
          expect(sendMock).not.toBeCalled();
        }
      });
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
});
