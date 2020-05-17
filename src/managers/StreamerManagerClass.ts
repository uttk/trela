import { StreamClass } from "../elements/StreamClass";
import { StreamerClass } from "../elements/streamers/StreamerClass";
import { SeriesStreamerClass } from "../elements/streamers/SeriesStreamerClass";
import { ParallelStreamerClass } from "../elements/streamers/ParallelStreamerClass";
import {
  Store,
  Effect,
  Stream,
  Streamer,
  Affecters,
  StreamerManager,
} from "../types";

// eslint-disable-next-line prettier/prettier
export class StreamerManagerClass<S> implements StreamerManager<S> {
  private affecters: Affecters;
  private store: Store<S, any>;
  private streamerCache: Map<string, Streamer<S>> = new Map();

  constructor(store: Store<S, any>, affecters: Affecters) {
    this.store = store;
    this.affecters = affecters;
  }

  private returnCache(streamer: Streamer<S>): Streamer<S> {
    const cache = this.streamerCache.get(streamer.id);

    if (cache) return cache;

    this.streamerCache.set(streamer.id, streamer);

    return streamer;
  }

  private createStream(request: string, payload: any): Stream {
    const stream = new StreamClass({ type: "request", request, payload });

    Object.entries(this.affecters).map(([key, affecter]) => {
      stream.setAffecter(key as Effect["type"], affecter);
    });

    return stream;
  }

  createSeriesStreamer(streamers: Streamer<S>[]) {
    return this.returnCache(new SeriesStreamerClass<S>(streamers, this.store));
  }

  createParallelStreamer(streamers: Streamer<S>[]) {
    return this.returnCache(
      new ParallelStreamerClass<S>(streamers, this.store)
    );
  }

  createStreamer(request: string, payload: any): Streamer<S> {
    const stream = this.createStream(request, payload);
    const streamer = new StreamerClass<S>(stream, this.store);

    return this.returnCache(streamer);
  }
}
