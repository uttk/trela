import { StoreClass } from "../../src/elements/StoreClass";
import { StreamerClass } from "../../src/elements/streamers/StreamerClass";
import { StreamerManagerClass } from "../../src/managers/StreamerManagerClass";
import { SeriesStreamerClass } from "../../src/elements/streamers/SeriesStreamerClass";
import { ParallelStreamerClass } from "../../src/elements/streamers/ParallelStreamerClass";

describe("StreamerManagerClass Tests", () => {
  let store: StoreClass<any, any>;
  let streamerMg: StreamerManagerClass<any>;

  beforeEach(() => {
    store = new StoreClass({ initState: 0, reducer: (s) => s });
    streamerMg = new StreamerManagerClass(store, {} as any);
  });

  test("StreamerManagerClass Instantiate", () => {
    expect(() => new StreamerManagerClass(store, {} as any)).not.toThrow();
  });

  describe("createStreamer function", () => {
    test("Return StreamerClass instance", () => {
      const streamer = streamerMg.createStreamer("test", []);

      expect(streamer).toBeInstanceOf(StreamerClass);
    });

    test("createStreamer return the cache when the arguments are the same", () => {
      const streamer = streamerMg.createStreamer("test", []);
      const cache = streamerMg.createStreamer("test", []);

      expect(streamer).toEqual(cache);
    });
  });

  describe("createParallelStreamer function", () => {
    test("Return ParallelStreamerClass instance", () => {
      const st = streamerMg.createStreamer("test", []);
      const streamer = streamerMg.createParallelStreamer([st]);

      expect(streamer).toBeInstanceOf(ParallelStreamerClass);
    });

    test("createParallelStreamer return the cache when the arguments are the same", () => {
      const st = streamerMg.createStreamer("test", []);
      const streamer = streamerMg.createParallelStreamer([st]);
      const cache = streamerMg.createParallelStreamer([st]);

      expect(streamer).toEqual(cache);
    });
  });

  describe("createSeriesStreamer function", () => {
    test("Return SeriesStreamerClass instance", () => {
      const st = streamerMg.createStreamer("test", []);
      const streamer = streamerMg.createSeriesStreamer([st]);

      expect(streamer).toBeInstanceOf(SeriesStreamerClass);
    });

    test("createSeriesStreamer return the cache when the arguments are the same", () => {
      const st = streamerMg.createStreamer("test", []);
      const streamer = streamerMg.createSeriesStreamer([st]);
      const cache = streamerMg.createSeriesStreamer([st]);

      expect(streamer).toEqual(cache);
    });
  });
});
