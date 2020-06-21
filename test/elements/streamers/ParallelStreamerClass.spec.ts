import { StoreClass } from "../../../src/elements/StoreClass";
import { createAffecters } from "../../../src/utils/createAffecters";
import { StreamerManagerClass } from "../../../src/managers/StreamerManagerClass";
import { ParallelStreamerClass } from "../../../src/elements/streamers/ParallelStreamerClass";
import { Streamer, StreamerStatus } from "../../../src/types";

describe("ParallelStreamerClass Tests", () => {
  const initState = 0;

  let store: StoreClass<typeof initState, any>;
  let childStreamers: Streamer<any>[];
  let streamer: ParallelStreamerClass<typeof initState>;
  let streamerMg: StreamerManagerClass<typeof initState>;

  beforeEach(() => {
    store = new StoreClass({ initState, reducer: (s) => s });
    streamerMg = new StreamerManagerClass(store, createAffecters(store));

    const simpleSt = streamerMg.createStreamer("test", []);
    const seriesSt = streamerMg.createSeriesStreamer([simpleSt]);
    const parallelSt = streamerMg.createSeriesStreamer([simpleSt, seriesSt]);

    childStreamers = [simpleSt, seriesSt, parallelSt];

    streamer = new ParallelStreamerClass(childStreamers, store);
  });

  describe("backStart function", () => {
    let startMocks: jest.Mock[];

    beforeEach(() => {
      startMocks = [];

      childStreamers.forEach((child) => {
        const mock = jest.fn(child.start.bind(child));
        child.start = mock;
        startMocks.push(mock);
      });
    });

    test("Execute the start function of all child streamers", () => {
      streamer["status"] = "started";
      streamer["backStart"]();
      startMocks.forEach((mock) => expect(mock).toBeCalled());
    });

    test("Receive notification of all streamers completion", () => {
      const compliteMock = jest.fn();

      streamer.addEventListener("finished", compliteMock);

      const exec = () => {
        streamer["status"] = "started";
        streamer["backStart"]();
        childStreamers.forEach((s) => s.finish());
      };

      exec();
      expect(compliteMock).toBeCalledTimes(1);
      expect(streamer["status"]).toBe("finished");

      exec();
      expect(compliteMock).toBeCalledTimes(2);
      expect(streamer["status"]).toBe("finished");
    });

    test("Execute all child streamers' start function when the streamer status is 'started'", () => {
      const status: StreamerStatus[] = [
        "none",
        "error",
        "cancel",
        "started",
        "finished",
      ];

      status.forEach((state) => {
        streamer["status"] = state;
        streamer["backStart"]();

        if (state === "started") {
          startMocks.forEach((mock) => {
            expect(mock).toBeCalled();
            mock.mockReset();
          });
        } else {
          startMocks.forEach((mock) => expect(mock).not.toBeCalled());
        }
      });
    });
  });

  describe("cancel function", () => {
    test("Pass a cancel payload to streamer", () => {
      const cancelMocks: jest.Mock[] = [];

      childStreamers.forEach((st) => {
        const mock = jest.fn();
        st.cancel = mock;
        cancelMocks.push(mock);
      });

      streamer.start();
      streamer.cancel("test");

      expect(streamer["status"]).toEqual("cancel");
      cancelMocks.forEach((mock) => {
        expect(mock).toBeCalledTimes(1);
        expect(mock).toBeCalledWith("test");
      });
    });

    test("Can cancel only when 'started'", () => {
      const cancelMock = jest.fn();

      childStreamers.forEach((st) => {
        st.cancel = cancelMock;
      });

      streamer.cancel("test");

      expect(cancelMock).not.toBeCalled();
      expect(streamer["status"]).not.toEqual("cancel");
    });
  });

  describe("error function", () => {
    test("Pass as error object to stream", () => {
      const errorMocks: jest.Mock[] = [];
      const testError = new Error("Test");

      childStreamers.forEach((st) => {
        const mock = jest.fn();
        st.error = mock;
        errorMocks.push(mock);
      });

      streamer.start();
      streamer.error(testError);

      expect(streamer["status"]).toEqual("error");
      errorMocks.forEach((mock) => {
        expect(mock).toBeCalledTimes(1);
        expect(mock).toBeCalledWith(testError);
      });
    });

    test("Can error only when 'started'", () => {
      const testError = new Error("Test");
      const errorMock = jest.fn();

      childStreamers.forEach((st) => {
        st.error = errorMock;
      });

      streamer.error(testError);

      expect(errorMock).not.toBeCalled();
      expect(streamer["status"]).not.toEqual("error");
    });
  });
});
