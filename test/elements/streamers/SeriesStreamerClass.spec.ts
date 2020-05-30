import { StoreClass } from "../../../src/elements/StoreClass";
import { createAffecters } from "../../../src/utils/createAffecters";
import { StreamerManagerClass } from "../../../src/managers/StreamerManagerClass";
import { SeriesStreamerClass } from "../../../src/elements/streamers/SeriesStreamerClass";
import { Streamer } from "../../../src/types";

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
    test("Execute the forceStart function of child streamer", () => {
      const forceStartMocks: jest.Mock[] = [];

      childStreamers.forEach((streamer) => {
        const mock = jest.fn();
        streamer.forceStart = mock;
        forceStartMocks.push(mock);
      });

      const firstChildMock = forceStartMocks.shift();

      const [state, isPending] = streamer.start();

      expect(streamer["status"]).toEqual("started");
      expect(state).toEqual(initState);
      expect(isPending).toBeTruthy();
      expect(firstChildMock).toBeCalled();
      forceStartMocks.forEach((mock) => expect(mock).not.toBeCalled());
    });

    test("Execute the start function of next streamer when the streamer ends", () => {
      const forceStartMocks: jest.Mock[] = [];

      childStreamers.forEach((streamer) => {
        const mock = jest.fn(streamer.forceStart.bind(streamer));
        streamer.forceStart = mock;
        forceStartMocks.push(mock);
      });

      streamer.start();
      childStreamers[0].finish();
      childStreamers[1].finish();

      forceStartMocks.forEach((mock) => expect(mock).toBeCalled());
    });

    test("Receive notification of all streamer completion", () => {
      const compliteMock = jest.fn();

      streamer.addEventListener("finished", compliteMock);
      streamer.start();
      childStreamers.forEach((s) => s.finish());
      expect(compliteMock).toBeCalledTimes(1);

      streamer["status"] = "none";
      streamer.start();
      childStreamers.forEach((s) => s.finish());
      expect(compliteMock).toBeCalledTimes(2);
    });

    test("Execute the start function of stream only once", () => {
      const forceStartMocks: jest.Mock[] = [];

      childStreamers.forEach((streamer) => {
        const mock = jest.fn(streamer.forceStart.bind(streamer));
        streamer.forceStart = mock;
        forceStartMocks.push(mock);
      });

      const firstMock = forceStartMocks.shift();

      streamer.start();
      expect(firstMock).toBeCalledTimes(1);

      streamer.start();
      expect(firstMock).toBeCalledTimes(1);

      forceStartMocks.forEach((mock) => expect(mock).not.toBeCalled());
    });
  });

  describe("forceStart function", () => {
    test("Always execute the forceStart function of first streamer whenever not in 'started' status", () => {
      const forceStartMocks: jest.Mock[] = [];

      childStreamers.forEach((streamer) => {
        const mock = jest.fn(streamer.forceStart.bind(streamer));
        streamer.forceStart = mock;
        forceStartMocks.push(mock);
      });

      const firstMock = forceStartMocks.shift();

      streamer.forceStart();
      expect(firstMock).toBeCalledTimes(1);

      streamer.cancel();
      streamer.forceStart();
      expect(firstMock).toBeCalledTimes(2);

      forceStartMocks.forEach((mock) => expect(mock).not.toBeCalled());
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
      const eventMock = jest.fn();

      streamer.addEventListener("finished", eventMock);
      streamer.finish();

      expect(eventMock).not.toBeCalled();
    });
  });
});
