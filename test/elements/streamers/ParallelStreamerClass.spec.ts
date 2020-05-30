import { StoreClass } from "../../../src/elements/StoreClass";
import { createAffecters } from "../../../src/utils/createAffecters";
import { StreamerManagerClass } from "../../../src/managers/StreamerManagerClass";
import { ParallelStreamerClass } from "../../../src/elements/streamers/ParallelStreamerClass";
import { Streamer } from "../../../src/types";

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
    test("Execute the start function of all child streamer", () => {
      const forceStartMock = jest.fn();

      childStreamers.forEach((st) => {
        st.forceStart = forceStartMock;
      });

      const [state, isPending] = streamer.start();

      expect(streamer["status"]).toEqual("started");
      expect(forceStartMock).toBeCalledTimes(childStreamers.length);
      expect(state).toEqual(initState);
      expect(isPending).toBeTruthy();
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
      const startEventMocks: jest.Mock[] = [];

      childStreamers.forEach((st) => {
        const mock = jest.fn();
        st.addEventListener("started", mock);
        startEventMocks.push(mock);
      });

      streamer.start();
      startEventMocks.forEach((mock) => expect(mock).toBeCalledTimes(1));

      streamer.start();
      startEventMocks.forEach((mock) => expect(mock).toBeCalledTimes(1));
    });
  });

  describe("forceStart function", () => {
    test("Always execute the forceStart function of all streamer whenever not in 'started' status", () => {
      const forceStartMock = jest.fn();
      const len = childStreamers.length;

      childStreamers.forEach((st) => {
        st.forceStart = forceStartMock;
      });

      streamer.forceStart();
      expect(forceStartMock).toBeCalledTimes(len);

      streamer.cancel();
      streamer.forceStart();
      expect(forceStartMock).toBeCalledTimes(len * 2);
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
