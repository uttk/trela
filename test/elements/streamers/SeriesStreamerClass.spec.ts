import { StoreClass } from "../../../src/elements/StoreClass";
import { createAffecters } from "../../../src/utils/createAffecters";
import { StreamerManagerClass } from "../../../src/managers/StreamerManagerClass";
import { SeriesStreamerClass } from "../../../src/elements/streamers/SeriesStreamerClass";
import { Streamer, StreamerStatus } from "../../../src/types";

describe("SeriesStreamerClass Tests", () => {
  const initState = 0;

  let streamer: SeriesStreamerClass<any>;
  let childStreamers: Streamer<any>[] = [];
  let store: StoreClass<typeof initState, any>;
  let streamerMg: StreamerManagerClass<any>;

  beforeEach(() => {
    store = new StoreClass({ initState, reducer: (s) => s });
    streamerMg = new StreamerManagerClass(store, createAffecters(store));

    const simpleSt = streamerMg.createStreamer("test", []);
    const seriesSt = streamerMg.createSeriesStreamer([simpleSt]);
    const parallelSt = streamerMg.createParallelStreamer([simpleSt, seriesSt]);

    childStreamers = [simpleSt, seriesSt, parallelSt];

    streamer = new SeriesStreamerClass(childStreamers, store);
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

    test("Execute the first child streamer's start function only", () => {
      const firstChildMock = startMocks.shift();

      streamer["status"] = "started";
      streamer["backStart"]();

      expect(firstChildMock).toBeCalled();
      expect(streamer["status"]).toEqual("started");
      startMocks.forEach((mock) => expect(mock).not.toBeCalled());
    });

    test("Execute the start function of next streamer when the previous streamer ends", () => {
      streamer["status"] = "started";
      streamer["backStart"]();
      childStreamers.forEach((child) => child.finish());
      startMocks.forEach((mock) => expect(mock).toBeCalled());
    });

    test("Receives notification of all streamers completion", () => {
      const compliteMock = jest.fn();

      streamer.addEventListener("finished", compliteMock);
      streamer["status"] = "started";
      streamer["backStart"]();
      childStreamers.forEach((s) => s.finish());
      expect(compliteMock).toBeCalled();
      expect(streamer["status"]).toBe("finished");

      streamer["status"] = "started";
      streamer["backStart"]();
      childStreamers.forEach((s) => s.finish());
      expect(compliteMock).toBeCalledTimes(2);
    });

    test("Execute the first child streamer's start function when the streamer status is 'started'", () => {
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
          expect(startMocks[0]).toBeCalledTimes(1);
          startMocks[0].mockReset();
        } else {
          expect(startMocks[0]).not.toBeCalled();
        }
      });

      startMocks.forEach((mock) => expect(mock).not.toBeCalled());
    });
  });

  describe("cancel function", () => {
    test("Pass a cancel payload to streamer", () => {
      const cancelMock = jest.fn();

      childStreamers.forEach((st) => {
        st.cancel = cancelMock;
      });
      streamer.start();
      streamer.cancel("test");

      expect(cancelMock).toBeCalledTimes(1);
      expect(cancelMock).toBeCalledWith("test");
      expect(streamer["status"]).toEqual("cancel");
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

    test("Do not execute the next stream when execute the cancel", () => {
      const forceStartMocks: jest.Mock[] = [];

      childStreamers.forEach((st) => {
        const mock = jest.fn(st.forceStart.bind(st));

        st.forceStart = mock;
        forceStartMocks.push(mock);
      });

      forceStartMocks.shift();

      streamer.start();
      streamer.cancel("test");
      childStreamers[0].finish();

      forceStartMocks.forEach((mock) => expect(mock).not.toBeCalled());
    });
  });

  describe("error function", () => {
    test("Pass as error object to stream", () => {
      const errorMock = jest.fn();
      const testError = new Error("Test");

      childStreamers.forEach((st) => {
        st.error = errorMock;
      });

      streamer.start();
      streamer.error(testError);

      expect(errorMock).toBeCalledTimes(1);
      expect(errorMock).toBeCalledWith(testError);
      expect(streamer["status"]).toEqual("error");
    });

    test("Can error only when 'started'", () => {
      const testError = new Error("Test");
      const errorMock = jest.fn();

      childStreamers[0].error = errorMock;
      streamer.error(testError);

      expect(errorMock).not.toBeCalledWith(errorMock);
      expect(streamer["status"]).not.toEqual("error");
    });

    test("Do not execute the next stream when execute the error", (done) => {
      const nextStartMock = jest.fn(childStreamers[1].start);
      const testError = new Error("Test");

      childStreamers.forEach((s, i) => {
        if (i) s.start = nextStartMock as any;
      });

      streamer.start();

      setTimeout(() => {
        try {
          streamer.error(testError);
        } catch (e) {
          expect(e).toBe(testError);
        }
      }, 100);

      setTimeout(() => {
        childStreamers[0].finish();

        expect(nextStartMock).not.toBeCalled();

        done();
      }, 1000);
    });
  });
});
